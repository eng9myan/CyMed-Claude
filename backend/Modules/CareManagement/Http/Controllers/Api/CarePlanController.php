<?php

namespace Modules\CareManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CareManagement\Models\CarePlan;

class CarePlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.notes.view', 'clinical.notes.create'])) {
            abort(403);
        }

        $plans = CarePlan::with(['patient:id,first_name,last_name,mrn', 'createdBy:id,first_name,last_name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $plans->items(),
            'meta' => [
                'total' => $plans->total(),
                'per_page' => $plans->perPage(),
                'current_page' => $plans->currentPage(),
                'last_page' => $plans->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinical.notes.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'plan_title' => ['required', 'string', 'max:255'],
            'care_type' => ['nullable', 'in:general,oncology,chronic,palliative,rehabilitation,maternity'],
            'goals' => ['nullable', 'array'],
            'goals.*.goal' => ['required_with:goals', 'string'],
            'goals.*.target_date' => ['nullable', 'date'],
            'interventions' => ['nullable', 'array'],
            'interventions.*.action' => ['required_with:interventions', 'string'],
            'interventions.*.frequency' => ['nullable', 'string'],
            'interventions.*.responsible_role' => ['nullable', 'string'],
            'barriers' => ['nullable', 'array'],
            'review_date' => ['nullable', 'date'],
            'patient_education_notes' => ['nullable', 'string'],
            'discharge_criteria' => ['nullable', 'string'],
        ]);

        $validated['created_by'] = $authUser->id;
        $validated['status'] = 'active';

        $plan = CarePlan::create($validated);

        return response()->json([
            'data' => $plan->load(['patient:id,first_name,last_name,mrn', 'createdBy:id,first_name,last_name']),
            'message' => 'Care plan created.',
        ], 201);
    }

    public function show(Request $request, CarePlan $plan): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.notes.view', 'clinical.notes.create'])) {
            abort(403);
        }

        return response()->json([
            'data' => $plan->load(['patient:id,first_name,last_name,mrn', 'createdBy:id,first_name,last_name', 'approvedBy:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, CarePlan $plan): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinical.notes.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'plan_title' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,active,on_hold,completed,revoked'],
            'goals' => ['nullable', 'array'],
            'interventions' => ['nullable', 'array'],
            'barriers' => ['nullable', 'array'],
            'review_date' => ['nullable', 'date'],
            'patient_education_notes' => ['nullable', 'string'],
            'discharge_criteria' => ['nullable', 'string'],
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['approved_by'] = $authUser->id;
            $validated['approved_at'] = now();
        }

        $plan->update($validated);

        return response()->json([
            'data' => $plan->fresh(),
            'message' => 'Care plan updated.',
        ]);
    }

    public function destroy(CarePlan $plan): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('clinical.notes.create')) {
            abort(403);
        }

        $plan->delete();

        return response()->json(null, 204);
    }
}
