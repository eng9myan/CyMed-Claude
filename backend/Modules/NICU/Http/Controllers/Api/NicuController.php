<?php

namespace Modules\NICU\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\NICU\Models\NicuAdmission;
use Modules\NICU\Models\NicuFlowsheet;

class NicuController extends Controller
{
    public function admissions(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['nicu.view', 'nicu.manage'])) {
            abort(403);
        }

        $admissions = NicuAdmission::where('status', 'active')
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->with([
                'patient:id,first_name,last_name,mrn',
                'admittedBy:id,first_name,last_name',
            ])
            ->orderByDesc('admitted_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $admissions->items(),
            'meta' => [
                'total' => $admissions->total(),
                'per_page' => $admissions->perPage(),
                'current_page' => $admissions->currentPage(),
                'last_page' => $admissions->lastPage(),
            ],
        ]);
    }

    public function admit(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nicu.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'mother_patient_id' => ['nullable', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'birth_weight_grams' => ['nullable', 'integer', 'min:200', 'max:8000'],
            'gestational_age_weeks' => ['nullable', 'integer', 'min:20', 'max:44'],
            'apgar_1min' => ['nullable', 'integer', 'min:0', 'max:10'],
            'apgar_5min' => ['nullable', 'integer', 'min:0', 'max:10'],
            'admission_reason' => ['required', 'string', 'max:255'],
            'incubator_number' => ['nullable', 'string', 'max:20'],
        ]);

        $validated['admission_number'] = NicuAdmission::generateAdmissionNumber();
        $validated['admitted_by'] = $authUser->id;
        $validated['status'] = 'active';
        $validated['admitted_at'] = now();

        $admission = NicuAdmission::create($validated);

        return response()->json([
            'data' => $admission->load(['patient:id,first_name,last_name,mrn', 'admittedBy:id,first_name,last_name']),
            'message' => 'Newborn admitted to NICU.',
        ], 201);
    }

    public function discharge(Request $request, NicuAdmission $admission): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nicu.manage')) {
            abort(403);
        }

        $admission->update([
            'status' => 'discharged',
            'discharged_at' => now(),
        ]);

        return response()->json([
            'data' => $admission->fresh(),
            'message' => 'Patient discharged from NICU.',
        ]);
    }

    public function flowsheets(Request $request, NicuAdmission $admission): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['nicu.view', 'nicu.manage'])) {
            abort(403);
        }

        $flowsheets = NicuFlowsheet::where('admission_id', $admission->id)
            ->with(['recordedBy:id,first_name,last_name'])
            ->orderByDesc('recorded_at')
            ->paginate((int) ($request->per_page ?? 24));

        return response()->json([
            'data' => $flowsheets->items(),
            'meta' => [
                'total' => $flowsheets->total(),
                'per_page' => $flowsheets->perPage(),
                'current_page' => $flowsheets->currentPage(),
                'last_page' => $flowsheets->lastPage(),
            ],
        ]);
    }

    public function recordFlowsheet(Request $request, NicuAdmission $admission): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nicu.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'recorded_at' => ['nullable', 'date'],
            'weight_grams' => ['nullable', 'integer', 'min:200', 'max:8000'],
            'temperature_celsius' => ['nullable', 'numeric', 'between:30,42'],
            'heart_rate' => ['nullable', 'integer', 'min:60', 'max:300'],
            'respiratory_rate' => ['nullable', 'integer', 'min:10', 'max:100'],
            'spo2_percent' => ['nullable', 'numeric', 'between:50,100'],
            'blood_glucose' => ['nullable', 'numeric', 'min:0'],
            'feeding_type' => ['nullable', 'in:breast,formula,ng_tube,tpn'],
            'feeding_volume_ml' => ['nullable', 'numeric', 'min:0'],
            'urine_output_ml' => ['nullable', 'numeric', 'min:0'],
            'on_ventilator' => ['nullable', 'boolean'],
            'on_phototherapy' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['admission_id'] = $admission->id;
        $validated['recorded_by'] = $authUser->id;
        $validated['recorded_at'] = $validated['recorded_at'] ?? now();

        $flowsheet = NicuFlowsheet::create($validated);

        return response()->json([
            'data' => $flowsheet->load(['recordedBy:id,first_name,last_name']),
            'message' => 'NICU flowsheet recorded.',
        ], 201);
    }
}
