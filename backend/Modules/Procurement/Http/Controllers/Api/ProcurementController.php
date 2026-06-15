<?php

namespace Modules\Procurement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\Facility;
use Modules\Inventory\Models\InventoryItem;
use Modules\Inventory\Models\StockMovement;
use Modules\Procurement\Models\PurchaseOrder;
use Modules\Procurement\Models\PurchaseOrderItem;
use Modules\Procurement\Models\Vendor;

class ProcurementController extends Controller
{
    public function vendors(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('procurement.view')) {
            abort(403);
        }

        $vendors = Vendor::where('is_active', true)
            ->orderBy('name')
            ->paginate(20);

        return response()->json([
            'data' => $vendors->items(),
            'meta' => [
                'total' => $vendors->total(),
                'per_page' => $vendors->perPage(),
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
            ],
        ]);
    }

    public function storeVendor(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('procurement.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'name_ar' => ['nullable', 'string', 'max:200'],
            'vendor_type' => ['required', 'in:supplier,manufacturer,distributor,service_provider'],
            'contact_person' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'country' => ['nullable', 'string', 'size:2'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'iban' => ['nullable', 'string', 'max:34'],
            'payment_terms' => ['nullable', 'integer', 'min:0'],
        ]);

        // Generate vendor code
        $count = Vendor::count() + 1;
        $validated['vendor_code'] = 'VEN-' . str_pad($count, 6, '0', STR_PAD_LEFT);
        $validated['is_active'] = true;

        $vendor = Vendor::create($validated);

        return response()->json([
            'data' => $vendor,
            'message' => 'Vendor created.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('procurement.view')) {
            abort(403);
        }

        $orders = PurchaseOrder::with(['vendor:id,name,vendor_code', 'requestedBy:id,first_name,last_name'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->vendor_id, fn ($q, $v) => $q->where('vendor_id', $v))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('procurement.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'vendor_id' => ['required', 'uuid', 'exists:vendors,id'],
            'order_date' => ['required', 'date'],
            'expected_delivery' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_description' => ['required', 'string', 'max:255'],
            'items.*.quantity_ordered' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.inventory_item_id' => ['nullable', 'uuid', 'exists:inventory_items,id'],
        ]);

        // Calculate subtotal
        $subtotal = collect($validated['items'])->sum(function ($item) {
            return $item['quantity_ordered'] * $item['unit_price'];
        });

        $facility = Facility::find($validated['facility_id']);
        $vatRate = $facility?->vat_rate ?? 15;
        $taxAmount = round($subtotal * ($vatRate / 100), 2);
        $totalAmount = round($subtotal + $taxAmount, 2);

        $po = PurchaseOrder::create([
            'po_number' => PurchaseOrder::generatePoNumber(),
            'facility_id' => $validated['facility_id'],
            'vendor_id' => $validated['vendor_id'],
            'requested_by' => $authUser->id,
            'status' => 'draft',
            'order_date' => $validated['order_date'],
            'expected_delivery' => $validated['expected_delivery'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ]);

        foreach ($validated['items'] as $item) {
            $totalPrice = round($item['quantity_ordered'] * $item['unit_price'], 2);
            PurchaseOrderItem::create([
                'po_id' => $po->id,
                'inventory_item_id' => $item['inventory_item_id'] ?? null,
                'item_description' => $item['item_description'],
                'quantity_ordered' => $item['quantity_ordered'],
                'quantity_received' => 0,
                'unit_price' => $item['unit_price'],
                'total_price' => $totalPrice,
            ]);
        }

        return response()->json([
            'data' => $po->load(['vendor', 'items', 'requestedBy:id,first_name,last_name']),
            'message' => 'Purchase order created.',
        ], 201);
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('procurement.view')) {
            abort(403);
        }

        return response()->json([
            'data' => $purchaseOrder->load(['vendor', 'items', 'requestedBy:id,first_name,last_name', 'approvedBy:id,first_name,last_name']),
        ]);
    }

    public function approve(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('procurement.manage')) {
            abort(403);
        }

        if ($purchaseOrder->status !== 'submitted') {
            return response()->json(['message' => 'Only submitted purchase orders can be approved.'], 422);
        }

        $purchaseOrder->update([
            'status' => 'approved',
            'approved_by' => $authUser->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'data' => $purchaseOrder->fresh()->load(['vendor', 'items']),
            'message' => 'Purchase order approved.',
        ]);
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('procurement.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'uuid', 'exists:purchase_order_items,id'],
            'items.*.quantity_received' => ['required', 'numeric', 'min:0'],
        ]);

        foreach ($validated['items'] as $itemData) {
            $poItem = PurchaseOrderItem::find($itemData['id']);
            if (! $poItem || $poItem->po_id !== $purchaseOrder->id) {
                continue;
            }

            $newQtyReceived = $poItem->quantity_received + $itemData['quantity_received'];
            $poItem->update(['quantity_received' => $newQtyReceived]);

            // Create stock movement if linked to inventory item
            if ($poItem->inventory_item_id && $itemData['quantity_received'] > 0) {
                $inventoryItem = InventoryItem::find($poItem->inventory_item_id);
                if ($inventoryItem) {
                    $beforeQty = $inventoryItem->quantity_on_hand;
                    $afterQty = $beforeQty + $itemData['quantity_received'];
                    $inventoryItem->update(['quantity_on_hand' => $afterQty]);

                    StockMovement::create([
                        'inventory_item_id' => $poItem->inventory_item_id,
                        'movement_type' => 'receipt',
                        'quantity' => $itemData['quantity_received'],
                        'before_qty' => $beforeQty,
                        'after_qty' => $afterQty,
                        'unit_cost' => $poItem->unit_price,
                        'reference_type' => 'purchase_order',
                        'reference_id' => $purchaseOrder->id,
                        'performed_by' => $authUser->id,
                        'notes' => "Received from PO: {$purchaseOrder->po_number}",
                        'performed_at' => now(),
                    ]);
                }
            }
        }

        // Reload items to check fulfillment
        $purchaseOrder->refresh();
        $allReceived = $purchaseOrder->items->every(function ($item) {
            return $item->quantity_received >= $item->quantity_ordered;
        });
        $anyReceived = $purchaseOrder->items->some(function ($item) {
            return $item->quantity_received > 0;
        });

        $newStatus = $allReceived ? 'received' : ($anyReceived ? 'partially_received' : $purchaseOrder->status);
        $purchaseOrder->update(['status' => $newStatus]);

        return response()->json([
            'data' => $purchaseOrder->fresh()->load(['vendor', 'items']),
            'message' => 'Items received.',
        ]);
    }
}
