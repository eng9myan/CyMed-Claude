<?php

namespace Modules\InfectionControl\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\InfectionControl\Models\HaiSurveillanceRecord;
use Modules\InfectionControl\Models\HandHygieneObservation;

class InfectionControlAdvancedController extends Controller
{
    public function haiRecords(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('infection.surveillance.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $query = HaiSurveillanceRecord::where('facility_id', $validated['facility_id']);

        if ($request->has('hai_type')) {
            $query->where('hai_type', $request->hai_type);
        }

        $records = $query->orderByDesc('infection_date')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $records->items(),
            'meta' => [
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
            ],
        ]);
    }

    public function reportHai(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('infection.surveillance.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'hai_type' => ['required', 'in:CLABSI,CAUTI,VAP,SSI,MRSA,CDiff'],
            'infection_date' => ['required', 'date'],
            'organism' => ['nullable', 'string', 'max:255'],
            'resistance_pattern' => ['nullable', 'string', 'max:100'],
            'source' => ['sometimes', 'in:community,hospital'],
            'unit' => ['nullable', 'string', 'max:100'],
        ]);

        $record = HaiSurveillanceRecord::create(array_merge($validated, [
            'reported_by' => $authUser->id,
        ]));

        return response()->json([
            'data' => $record,
            'message' => 'HAI record reported.',
        ], 201);
    }

    public function handHygieneObservations(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('infection.surveillance.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $observations = HandHygieneObservation::where('facility_id', $validated['facility_id'])
            ->orderByDesc('observation_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $observations->items(),
            'meta' => [
                'total' => $observations->total(),
                'per_page' => $observations->perPage(),
                'current_page' => $observations->currentPage(),
                'last_page' => $observations->lastPage(),
            ],
        ]);
    }

    public function recordHandHygiene(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('infection.surveillance.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'unit' => ['required', 'string', 'max:100'],
            'observed_role' => ['required', 'in:physician,nurse,hca,other'],
            'total_opportunities' => ['required', 'integer', 'min:1'],
            'compliant_actions' => ['required', 'integer', 'min:0'],
            'observation_date' => ['required', 'date'],
        ]);

        $observation = HandHygieneObservation::create(array_merge($validated, [
            'observer_id' => $authUser->id,
        ]));

        return response()->json([
            'data' => $observation,
            'message' => 'Hand hygiene observation recorded.',
        ], 201);
    }
}
