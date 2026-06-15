<?php

namespace Modules\ICU\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ICU\Models\IcuFlowsheet;
use Modules\Patient\Models\Encounter;

class FlowsheetController extends Controller
{
    public function index(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['icu.flowsheet.view', 'icu.flowsheet.update'])) {
            abort(403);
        }

        $flowsheets = IcuFlowsheet::with(['recordedBy:id,first_name,last_name'])
            ->where('encounter_id', $encounter->id)
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

    public function store(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('icu.flowsheet.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'bed_id' => ['nullable', 'uuid', 'exists:beds,id'],
            'recorded_at' => ['nullable', 'date'],
            'gcs' => ['nullable', 'integer', 'between:3,15'],
            'gcs_eye' => ['nullable', 'integer', 'between:1,4'],
            'gcs_verbal' => ['nullable', 'integer', 'between:1,5'],
            'gcs_motor' => ['nullable', 'integer', 'between:1,6'],
            'pupil_left' => ['nullable', 'in:reactive,sluggish,fixed,unknown'],
            'pupil_right' => ['nullable', 'in:reactive,sluggish,fixed,unknown'],
            'on_ventilator' => ['nullable', 'boolean'],
            'ventilator_mode' => ['nullable', 'in:CMV,SIMV,PSV,CPAP,BiPAP,PRVC'],
            'peep' => ['nullable', 'numeric', 'between:0,30'],
            'fio2' => ['nullable', 'numeric', 'between:21,100'],
            'tidal_volume' => ['nullable', 'integer', 'between:0,1000'],
            'rr_set' => ['nullable', 'integer', 'between:0,60'],
            'rr_actual' => ['nullable', 'integer', 'between:0,80'],
            'spo2' => ['nullable', 'numeric', 'between:50,100'],
            'etco2' => ['nullable', 'integer', 'between:0,100'],
            'heart_rate' => ['nullable', 'integer', 'between:20,300'],
            'bp_systolic' => ['nullable', 'integer', 'between:40,300'],
            'bp_diastolic' => ['nullable', 'integer', 'between:20,200'],
            'map' => ['nullable', 'integer', 'between:20,200'],
            'cvp' => ['nullable', 'integer', 'between:-5,30'],
            'temperature' => ['nullable', 'numeric', 'between:30,45'],
            'urine_output_ml' => ['nullable', 'integer', 'min:0'],
            'fluid_balance' => ['nullable', 'numeric'],
            'drips' => ['nullable', 'array'],
            'drips.*.name' => ['required_with:drips', 'string'],
            'drips.*.rate' => ['required_with:drips', 'numeric', 'min:0'],
            'drips.*.units' => ['required_with:drips', 'string'],
            'repositioned' => ['nullable', 'boolean'],
            'suctioned' => ['nullable', 'boolean'],
            'oral_care_done' => ['nullable', 'boolean'],
            'eye_care_done' => ['nullable', 'boolean'],
            'restraints_applied' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['encounter_id'] = $encounter->id;
        $validated['patient_id'] = $encounter->patient_id;
        $validated['recorded_by'] = $authUser->id;
        $validated['recorded_at'] = $validated['recorded_at'] ?? now();

        $flowsheet = IcuFlowsheet::create($validated);

        return response()->json([
            'data' => $flowsheet->load(['recordedBy:id,first_name,last_name']),
            'message' => 'Flowsheet entry recorded.',
        ], 201);
    }

    public function show(Request $request, Encounter $encounter, IcuFlowsheet $flowsheet): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['icu.flowsheet.view', 'icu.flowsheet.update'])) {
            abort(403);
        }

        return response()->json([
            'data' => $flowsheet->load(['recordedBy:id,first_name,last_name', 'bed.ward']),
        ]);
    }
}
