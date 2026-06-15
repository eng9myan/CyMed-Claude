<?php

namespace Modules\BedManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\BedManagement\Models\DailyCapacitySnapshot;
use Modules\BedManagement\Models\SurgeCapacityPlan;

class CapacityPlanningController extends Controller
{
    public function snapshots(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('beds.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $snapshots = DailyCapacitySnapshot::where('facility_id', $validated['facility_id'])
            ->orderByDesc('snapshot_date')
            ->paginate((int) ($request->per_page ?? 30));

        return response()->json([
            'data' => $snapshots->items(),
            'meta' => [
                'total' => $snapshots->total(),
                'per_page' => $snapshots->perPage(),
                'current_page' => $snapshots->currentPage(),
                'last_page' => $snapshots->lastPage(),
            ],
        ]);
    }

    public function recordSnapshot(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('beds.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'snapshot_date' => ['required', 'date'],
            'total_beds' => ['required', 'integer', 'min:0'],
            'occupied_beds' => ['required', 'integer', 'min:0'],
            'icu_total' => ['required', 'integer', 'min:0'],
            'icu_occupied' => ['required', 'integer', 'min:0'],
            'er_visits' => ['required', 'integer', 'min:0'],
            'surgeries_performed' => ['required', 'integer', 'min:0'],
            'outpatient_visits' => ['required', 'integer', 'min:0'],
            'admissions' => ['required', 'integer', 'min:0'],
            'discharges' => ['required', 'integer', 'min:0'],
            'average_los' => ['nullable', 'numeric', 'min:0'],
        ]);

        $validated['available_beds'] = $validated['total_beds'] - $validated['occupied_beds'];
        $validated['bed_occupancy_rate'] = $validated['total_beds'] > 0
            ? round(($validated['occupied_beds'] / $validated['total_beds']) * 100, 2)
            : 0;

        $snapshot = DailyCapacitySnapshot::updateOrCreate(
            ['facility_id' => $validated['facility_id'], 'snapshot_date' => $validated['snapshot_date']],
            $validated
        );

        return response()->json([
            'data' => $snapshot,
            'message' => 'Capacity snapshot recorded.',
        ], 201);
    }

    public function surgePlans(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('beds.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $plans = SurgeCapacityPlan::where('facility_id', $validated['facility_id'])
            ->where('is_active', true)
            ->get();

        return response()->json(['data' => $plans]);
    }

    public function createSurgePlan(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('beds.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'plan_name' => ['required', 'string', 'max:100'],
            'trigger_condition' => ['required', 'string', 'max:255'],
            'additional_beds' => ['required', 'integer', 'min:0'],
            'actions' => ['nullable', 'array'],
        ]);

        $plan = SurgeCapacityPlan::create(array_merge($validated, [
            'actions' => $validated['actions'] ?? [],
        ]));

        return response()->json([
            'data' => $plan,
            'message' => 'Surge capacity plan created.',
        ], 201);
    }
}
