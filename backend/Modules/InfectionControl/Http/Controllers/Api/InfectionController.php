<?php

namespace Modules\InfectionControl\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\InfectionControl\Models\InfectionCase;

class InfectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['infection.surveillance.view', 'infection.surveillance.manage'])) {
            abort(403);
        }

        $cases = InfectionCase::with(['reportedBy:id,first_name,last_name', 'patient:id,first_name,last_name,mrn'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->case_type, fn ($q, $v) => $q->where('case_type', $v))
            ->when($request->infection_site, fn ($q, $v) => $q->where('infection_site', $v))
            ->orderByDesc('reported_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $cases->items(),
            'meta' => [
                'total' => $cases->total(),
                'per_page' => $cases->perPage(),
                'current_page' => $cases->currentPage(),
                'last_page' => $cases->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('infection.surveillance.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id' => ['nullable', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'pathogen' => ['nullable', 'string', 'max:100'],
            'case_type' => ['required', 'in:hai,community,outbreak,colonization'],
            'infection_site' => ['required', 'in:SSI,UTI,CLABSI,VAP,CAUTI,BSI,wound,respiratory,other'],
            'risk_factors' => ['nullable', 'string', 'max:500'],
            'is_multidrug_resistant' => ['nullable', 'boolean'],
            'is_reportable' => ['nullable', 'boolean'],
            'clinical_notes' => ['nullable', 'string'],
        ]);

        $validated['case_reference'] = InfectionCase::generateCaseReference();
        $validated['status'] = 'under_investigation';
        $validated['reported_by'] = $authUser->id;
        $validated['reported_at'] = now();

        $case = InfectionCase::create($validated);

        return response()->json([
            'data' => $case->load(['reportedBy:id,first_name,last_name']),
            'message' => 'Infection case reported.',
        ], 201);
    }

    public function show(Request $request, InfectionCase $case): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['infection.surveillance.view', 'infection.surveillance.manage'])) {
            abort(403);
        }

        return response()->json([
            'data' => $case->load(['reportedBy:id,first_name,last_name', 'patient:id,first_name,last_name,mrn', 'assignedTo:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, InfectionCase $case): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('infection.surveillance.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['nullable', 'in:under_investigation,confirmed,ruled_out,closed'],
            'pathogen' => ['nullable', 'string', 'max:100'],
            'is_multidrug_resistant' => ['nullable', 'boolean'],
            'is_reportable' => ['nullable', 'boolean'],
            'reported_to_moh' => ['nullable', 'boolean'],
            'assigned_to' => ['nullable', 'uuid', 'exists:users,id'],
            'clinical_notes' => ['nullable', 'string'],
            'interventions_taken' => ['nullable', 'array'],
            'lab_results' => ['nullable', 'array'],
        ]);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'confirmed') {
                $validated['confirmed_at'] = now();
            }
            if ($validated['status'] === 'closed') {
                $validated['closed_at'] = now();
            }
        }

        $case->update($validated);

        return response()->json([
            'data' => $case->fresh(),
            'message' => 'Infection case updated.',
        ]);
    }
}
