<?php

namespace Modules\Inventory\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Inventory\Models\ColdChainLog;
use Modules\Inventory\Models\InventoryAlert;

class SupplyChainController extends Controller
{
    public function coldChainLogs(Request $request): JsonResponse
    {
        $query = ColdChainLog::query();

        if ($request->has('inventory_item_id')) {
            $query->where('inventory_item_id', $request->inventory_item_id);
        }

        $logs = $query->orderByDesc('logged_at')
            ->paginate((int) ($request->per_page ?? 50));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total'        => $logs->total(),
                'per_page'     => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
            ],
        ]);
    }

    public function logTemperature(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('inventory.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'inventory_item_id'  => ['required', 'uuid', 'exists:inventory_items,id'],
            'temperature_celsius' => ['required', 'numeric'],
            'humidity_percent'   => ['nullable', 'numeric', 'min:0', 'max:100'],
            'location'           => ['required', 'string', 'max:255'],
            'logged_at'          => ['required', 'date'],
            'logger_device_id'   => ['nullable', 'string', 'max:100'],
        ]);

        // Determine if temperature is an alert (e.g., outside 2-8°C for cold chain)
        $isAlert = $validated['temperature_celsius'] < 2 || $validated['temperature_celsius'] > 8;

        $log = ColdChainLog::create(array_merge($validated, ['is_alert' => $isAlert]));

        if ($isAlert) {
            InventoryAlert::create([
                'inventory_item_id' => $validated['inventory_item_id'],
                'alert_type'        => 'temperature_breach',
                'severity'          => 'high',
                'message'           => "Temperature breach: {$validated['temperature_celsius']}°C at {$validated['location']}",
                'triggered_at'      => $validated['logged_at'],
            ]);
        }

        return response()->json([
            'data'    => $log,
            'message' => 'Temperature logged.',
        ], 201);
    }

    public function inventoryAlerts(Request $request): JsonResponse
    {
        $query = InventoryAlert::query();

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('is_resolved')) {
            $query->where('is_resolved', (bool) $request->is_resolved);
        }

        $alerts = $query->orderByDesc('triggered_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $alerts->items(),
            'meta' => [
                'total'        => $alerts->total(),
                'per_page'     => $alerts->perPage(),
                'current_page' => $alerts->currentPage(),
                'last_page'    => $alerts->lastPage(),
            ],
        ]);
    }

    public function resolveAlert(Request $request, string $alertId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('inventory.manage')) {
            abort(403);
        }

        $alert = InventoryAlert::findOrFail($alertId);
        $alert->update([
            'is_resolved' => true,
            'resolved_at' => now(),
            'resolved_by' => $authUser->id,
        ]);

        return response()->json([
            'data'    => $alert->fresh(),
            'message' => 'Alert resolved.',
        ]);
    }
}
