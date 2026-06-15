<?php

namespace Modules\Inventory\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Inventory\Models\InventoryItem;
use Modules\Inventory\Models\StockMovement;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['inventory.view', 'inventory.manage'])) {
            abort(403);
        }

        $items = InventoryItem::when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->when($request->low_stock, fn ($q) => $q->whereColumn('quantity_on_hand', '<=', 'reorder_level'))
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->where('is_active', true)
            ->orderBy('item_name')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $items->items(),
            'meta' => [
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('inventory.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'item_code' => ['required', 'string', 'max:30', 'unique:inventory_items,item_code'],
            'item_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:medication,medical_supply,equipment,consumable,lab_reagent,linen,other'],
            'unit' => ['nullable', 'string', 'max:20'],
            'quantity_on_hand' => ['nullable', 'numeric', 'min:0'],
            'reorder_level' => ['nullable', 'numeric', 'min:0'],
            'max_stock_level' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'location' => ['nullable', 'string', 'max:100'],
            'expiry_date' => ['nullable', 'date'],
        ]);

        $item = InventoryItem::create($validated);

        return response()->json([
            'data' => $item,
            'message' => 'Inventory item created.',
        ], 201);
    }

    public function show(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['inventory.view', 'inventory.manage'])) {
            abort(403);
        }

        return response()->json([
            'data' => $inventoryItem->load('movements'),
        ]);
    }

    public function movement(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('inventory.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'movement_type' => ['required', 'in:receipt,issue,transfer,adjustment,return,expired,damage'],
            'quantity' => ['required', 'numeric'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'reference_type' => ['nullable', 'string', 'max:30'],
            'reference_id' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $direction = in_array($validated['movement_type'], ['receipt', 'return']) ? 1 : -1;
        $before = (float) $inventoryItem->quantity_on_hand;
        $after = $before + ($direction * abs((float) $validated['quantity']));

        if ($after < 0) {
            return response()->json(['message' => 'Insufficient stock.'], 422);
        }

        $movement = StockMovement::create([
            'inventory_item_id' => $inventoryItem->id,
            'movement_type' => $validated['movement_type'],
            'quantity' => $validated['quantity'],
            'before_qty' => $before,
            'after_qty' => $after,
            'unit_cost' => $validated['unit_cost'] ?? $inventoryItem->unit_cost,
            'reference_type' => $validated['reference_type'] ?? null,
            'reference_id' => $validated['reference_id'] ?? null,
            'performed_by' => $authUser->id,
            'notes' => $validated['notes'] ?? null,
            'performed_at' => now(),
        ]);

        $inventoryItem->update(['quantity_on_hand' => $after]);

        return response()->json([
            'data' => [
                'movement' => $movement,
                'current_qty' => $inventoryItem->fresh()->quantity_on_hand,
                'is_low_stock' => $inventoryItem->fresh()->isLowStock(),
            ],
            'message' => 'Stock movement recorded.',
        ], 201);
    }

    public function lowStock(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['inventory.view', 'inventory.manage'])) {
            abort(403);
        }

        $items = InventoryItem::whereColumn('quantity_on_hand', '<=', 'reorder_level')
            ->where('is_active', true)
            ->orderBy('quantity_on_hand')
            ->get();

        return response()->json([
            'data' => $items,
            'count' => $items->count(),
        ]);
    }
}
