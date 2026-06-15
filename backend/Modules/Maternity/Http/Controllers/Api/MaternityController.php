<?php

namespace Modules\Maternity\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Maternity\Models\AntenatalVisit;
use Modules\Maternity\Models\LaborDelivery;

class MaternityController extends Controller
{
    public function antenatalVisits(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['maternity.view', 'maternity.manage'])) {
            abort(403);
        }

        $visits = AntenatalVisit::where('patient_id', $patientId)
            ->with(['provider:id,first_name,last_name'])
            ->orderByDesc('visit_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $visits->items(),
            'meta' => [
                'total' => $visits->total(),
                'per_page' => $visits->perPage(),
                'current_page' => $visits->currentPage(),
                'last_page' => $visits->lastPage(),
            ],
        ]);
    }

    public function storeAntenatalVisit(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('maternity.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'visit_date' => ['required', 'date'],
            'gestational_age_weeks' => ['nullable', 'integer', 'min:0', 'max:44'],
            'gestational_age_days' => ['nullable', 'integer', 'min:0', 'max:6'],
            'gravida' => ['nullable', 'integer', 'min:0'],
            'para' => ['nullable', 'integer', 'min:0'],
            'fundal_height_cm' => ['nullable', 'numeric', 'min:0'],
            'fetal_heart_rate' => ['nullable', 'integer', 'min:60', 'max:200'],
            'fetal_presentation' => ['nullable', 'in:cephalic,breech,transverse,oblique'],
            'blood_pressure_systolic' => ['nullable', 'integer', 'min:60', 'max:250'],
            'blood_pressure_diastolic' => ['nullable', 'integer', 'min:30', 'max:160'],
            'weight_kg' => ['nullable', 'numeric', 'min:30', 'max:200'],
            'urine_protein' => ['nullable', 'in:negative,trace,1+,2+,3+'],
            'urine_glucose' => ['nullable', 'in:negative,trace,1+,2+'],
            'edema' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['provider_id'] = $authUser->id;

        $visit = AntenatalVisit::create($validated);

        return response()->json([
            'data' => $visit->load(['provider:id,first_name,last_name']),
            'message' => 'Antenatal visit recorded.',
        ], 201);
    }

    public function laborDeliveries(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['maternity.view', 'maternity.manage'])) {
            abort(403);
        }

        $deliveries = LaborDelivery::where('patient_id', $patientId)
            ->with(['provider:id,first_name,last_name'])
            ->orderByDesc('delivery_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $deliveries->items(),
            'meta' => [
                'total' => $deliveries->total(),
                'per_page' => $deliveries->perPage(),
                'current_page' => $deliveries->currentPage(),
                'last_page' => $deliveries->lastPage(),
            ],
        ]);
    }

    public function storeDelivery(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('maternity.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'delivery_date' => ['required', 'date'],
            'delivery_time' => ['nullable', 'date_format:H:i:s'],
            'gestational_age_weeks' => ['nullable', 'integer', 'min:20', 'max:44'],
            'delivery_mode' => ['required', 'in:normal_vaginal,assisted_vaginal,elective_cs,emergency_cs'],
            'labor_onset' => ['required', 'in:spontaneous,induced,augmented'],
            'duration_labor_hours' => ['nullable', 'numeric', 'min:0'],
            'blood_loss_ml' => ['nullable', 'integer', 'min:0'],
            'complications' => ['nullable', 'string'],
            'anesthesia_type' => ['nullable', 'in:none,local,epidural,spinal,general'],
            'apgar_1min' => ['nullable', 'integer', 'min:0', 'max:10'],
            'apgar_5min' => ['nullable', 'integer', 'min:0', 'max:10'],
            'birth_weight_grams' => ['nullable', 'integer', 'min:200', 'max:8000'],
            'baby_gender' => ['nullable', 'in:male,female,unknown'],
            'neonatal_outcome' => ['required', 'in:live_birth,stillbirth,neonatal_death'],
            'mother_outcome' => ['nullable', 'in:stable,icu_transfer,death'],
        ]);

        $validated['provider_id'] = $authUser->id;

        $delivery = LaborDelivery::create($validated);

        return response()->json([
            'data' => $delivery->load(['provider:id,first_name,last_name']),
            'message' => 'Delivery recorded.',
        ], 201);
    }
}
