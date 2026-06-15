<?php

namespace Modules\AssetManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\AssetManagement\Models\Asset;
use Modules\AssetManagement\Models\MaintenanceLog;

class AssetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('assets.view')) {
            abort(403);
        }

        $assets = Asset::with(['facility:id,name,code', 'assignedTo:id,first_name,last_name'])
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->when($request->asset_type, fn ($q, $v) => $q->where('asset_type', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $assets->items(),
            'meta' => [
                'total' => $assets->total(),
                'per_page' => $assets->perPage(),
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('assets.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'asset_tag' => ['required', 'string', 'max:30', 'unique:assets,asset_tag'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'asset_name' => ['required', 'string', 'max:200'],
            'asset_type' => ['required', 'in:medical_equipment,furniture,it_equipment,vehicle,building_fixture,other'],
            'manufacturer' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'warranty_expiry' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:200'],
            'assigned_to' => ['nullable', 'uuid', 'exists:users,id'],
            'status' => ['nullable', 'in:active,under_maintenance,decommissioned,lost'],
        ]);

        $validated['status'] ??= 'active';

        $asset = Asset::create($validated);

        return response()->json([
            'data' => $asset->load(['facility:id,name,code']),
            'message' => 'Asset created.',
        ], 201);
    }

    public function show(Request $request, Asset $asset): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('assets.view')) {
            abort(403);
        }

        return response()->json([
            'data' => $asset->load(['facility', 'assignedTo', 'maintenanceLogs']),
        ]);
    }

    public function update(Request $request, Asset $asset): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('assets.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:active,under_maintenance,decommissioned,lost'],
            'location' => ['nullable', 'string', 'max:200'],
            'assigned_to' => ['nullable', 'uuid', 'exists:users,id'],
            'asset_name' => ['sometimes', 'string', 'max:200'],
            'next_maintenance_due' => ['nullable', 'date'],
        ]);

        $asset->update($validated);

        return response()->json([
            'data' => $asset->fresh(),
            'message' => 'Asset updated.',
        ]);
    }

    public function logMaintenance(Request $request, Asset $asset): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('assets.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'maintenance_type' => ['required', 'in:preventive,corrective,calibration,inspection'],
            'description' => ['required', 'string'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'next_due_date' => ['nullable', 'date'],
            'parts_replaced' => ['nullable', 'array'],
        ]);

        $log = MaintenanceLog::create([
            'asset_id' => $asset->id,
            'performed_by' => $authUser->id,
            'maintenance_type' => $validated['maintenance_type'],
            'description' => $validated['description'],
            'cost' => $validated['cost'] ?? null,
            'performed_at' => now(),
            'next_due_date' => $validated['next_due_date'] ?? null,
            'parts_replaced' => $validated['parts_replaced'] ?? [],
        ]);

        $assetUpdates = [
            'last_maintenance_at' => now(),
        ];

        if (! empty($validated['next_due_date'])) {
            $assetUpdates['next_maintenance_due'] = $validated['next_due_date'];
        }

        if ($validated['maintenance_type'] === 'corrective') {
            $assetUpdates['status'] = 'active';
        }

        $asset->update($assetUpdates);

        return response()->json([
            'data' => [
                'log' => $log,
                'asset' => $asset->fresh(),
            ],
            'message' => 'Maintenance logged.',
        ], 201);
    }

    public function dueMaintenance(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('assets.view')) {
            abort(403);
        }

        $cutoffDate = now()->addDays(7)->toDateString();

        $assets = Asset::with(['facility:id,name,code'])
            ->where(function ($q) use ($cutoffDate) {
                $q->where('next_maintenance_due', '<=', $cutoffDate)
                    ->orWhere('status', 'under_maintenance');
            })
            ->orderBy('next_maintenance_due')
            ->paginate(20);

        return response()->json([
            'data' => $assets->items(),
            'meta' => [
                'total' => $assets->total(),
                'per_page' => $assets->perPage(),
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
            ],
        ]);
    }
}
