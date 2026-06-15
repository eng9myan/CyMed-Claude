<?php

namespace Modules\PopulationHealth\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\PopulationHealth\Models\CareGap;
use Modules\PopulationHealth\Models\PopulationRegistry;
use Modules\PopulationHealth\Models\RiskScore;

class PopulationHealthController extends Controller
{
    public function registry(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('population.health.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $registry = PopulationRegistry::where('facility_id', $validated['facility_id'])
            ->where('is_active', true)
            ->paginate(20);

        return response()->json($registry);
    }

    public function registerCondition(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('population.health.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'    => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id'     => ['required', 'uuid', 'exists:patients,id'],
            'condition_code' => ['required', 'string', 'max:20'],
            'condition_name' => ['required', 'string', 'max:255'],
        ]);

        $entry = PopulationRegistry::create(array_merge($validated, [
            'enrolled_at' => now(),
            'is_active'   => true,
        ]));

        return response()->json($entry, 201);
    }

    public function careGaps(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('population.health.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $gaps = CareGap::where('facility_id', $validated['facility_id'])
            ->paginate(20);

        return response()->json($gaps);
    }

    public function createCareGap(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('population.health.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id'  => ['required', 'uuid', 'exists:patients,id'],
            'gap_type'    => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:500'],
            'due_date'    => ['nullable', 'date'],
        ]);

        $gap = CareGap::create(array_merge($validated, ['status' => 'open']));

        return response()->json($gap, 201);
    }

    public function resolveGap(Request $request, CareGap $careGap): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('population.health.manage')) {
            abort(403);
        }

        $careGap->update([
            'status'      => 'resolved',
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Gap resolved.', 'data' => $careGap]);
    }

    public function riskScores(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('population.health.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $scores = RiskScore::where('facility_id', $validated['facility_id'])
            ->orderByDesc('scored_at')
            ->paginate(20);

        return response()->json($scores);
    }
}
