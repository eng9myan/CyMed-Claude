<?php

namespace Modules\EMR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Nursing\Models\VitalSign;
use Modules\Patient\Models\Encounter;

class VitalSignsController extends Controller
{
    public function index(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.vitals.view', 'patients.view'])) {
            abort(403);
        }

        $vitals = VitalSign::where('encounter_id', $encounter->id)
            ->with('recordedBy:id,first_name,last_name')
            ->orderByDesc('recorded_at')
            ->get();

        return response()->json(['data' => $vitals]);
    }

    public function store(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.vitals.create'])) {
            abort(403);
        }

        $validated = $request->validate([
            'recorded_at' => ['required', 'date'],
            'temperature' => ['nullable', 'numeric', 'between:30,45'],
            'temperature_unit' => ['nullable', 'in:C,F'],
            'temperature_route' => ['nullable', 'string', 'max:20'],
            'heart_rate' => ['nullable', 'integer', 'between:20,300'],
            'blood_pressure_systolic' => ['nullable', 'integer', 'between:50,300'],
            'blood_pressure_diastolic' => ['nullable', 'integer', 'between:20,200'],
            'bp_position' => ['nullable', 'in:sitting,standing,supine'],
            'bp_arm' => ['nullable', 'in:left,right'],
            'mean_arterial_pressure' => ['nullable', 'integer'],
            'respiratory_rate' => ['nullable', 'integer', 'between:4,60'],
            'oxygen_saturation' => ['nullable', 'numeric', 'between:50,100'],
            'on_oxygen' => ['boolean'],
            'oxygen_flow_rate' => ['nullable', 'numeric', 'min:0'],
            'oxygen_delivery_device' => ['nullable', 'string', 'max:50'],
            'gcs_total' => ['nullable', 'integer', 'between:3,15'],
            'gcs_eye' => ['nullable', 'integer', 'between:1,4'],
            'gcs_verbal' => ['nullable', 'integer', 'between:1,5'],
            'gcs_motor' => ['nullable', 'integer', 'between:1,6'],
            'blood_glucose' => ['nullable', 'numeric', 'min:0'],
            'glucose_timing' => ['nullable', 'in:fasting,random,post_meal'],
            'weight_kg' => ['nullable', 'numeric', 'between:0.5,300'],
            'height_cm' => ['nullable', 'numeric', 'between:20,250'],
            'bmi' => ['nullable', 'numeric'],
            'pain_score' => ['nullable', 'integer', 'between:0,10'],
            'pain_scale' => ['nullable', 'in:NRS,VAS,FLACC,FACES'],
            'pain_location' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['patient_id'] = $encounter->patient_id;
        $validated['encounter_id'] = $encounter->id;
        $validated['recorded_by'] = $authUser->id;

        // Auto-calculate BMI if height and weight provided
        if (isset($validated['weight_kg']) && isset($validated['height_cm']) && ! isset($validated['bmi'])) {
            $heightM = $validated['height_cm'] / 100;
            $validated['bmi'] = round($validated['weight_kg'] / ($heightM * $heightM), 2);
        }

        $vital = VitalSign::create($validated);

        return response()->json([
            'data' => $vital->load('recordedBy:id,first_name,last_name'),
            'message' => 'Vital signs recorded.',
        ], 201);
    }

    public function show(Request $request, Encounter $encounter, VitalSign $vital): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.vitals.view', 'patients.view'])) {
            abort(403);
        }

        if ($vital->encounter_id !== $encounter->id) {
            abort(404);
        }

        return response()->json(['data' => $vital->load('recordedBy:id,first_name,last_name')]);
    }

    public function update(Request $request, Encounter $encounter, VitalSign $vital): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.vitals.create'])) {
            abort(403);
        }

        if ($vital->encounter_id !== $encounter->id) {
            abort(404);
        }

        $validated = $request->validate([
            'heart_rate' => ['nullable', 'integer', 'between:20,300'],
            'blood_pressure_systolic' => ['nullable', 'integer', 'between:50,300'],
            'blood_pressure_diastolic' => ['nullable', 'integer', 'between:20,200'],
            'oxygen_saturation' => ['nullable', 'numeric', 'between:50,100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $vital->update($validated);

        return response()->json(['data' => $vital->fresh()]);
    }

    public function destroy(Encounter $encounter, VitalSign $vital): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasAnyPermission(['clinical.vitals.create'])) {
            abort(403);
        }

        if ($vital->encounter_id !== $encounter->id) {
            abort(404);
        }

        $vital->delete();

        return response()->json(null, 204);
    }
}
