<?php

namespace Modules\Cardiology\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Cardiology\Models\CathLabCase;
use Modules\Cardiology\Models\EcgRecord;
use Modules\Cardiology\Models\EchoReport;

class CardiologyController extends Controller
{
    public function ecgs(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cardiology.view')) {
            abort(403);
        }

        $ecgs = EcgRecord::where('patient_id', $patientId)
            ->with(['performedBy:id,first_name,last_name', 'interpretedBy:id,first_name,last_name'])
            ->orderByDesc('performed_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $ecgs->items(),
            'meta' => [
                'total' => $ecgs->total(),
                'per_page' => $ecgs->perPage(),
                'current_page' => $ecgs->currentPage(),
                'last_page' => $ecgs->lastPage(),
            ],
        ]);
    }

    public function storeEcg(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cardiology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'interpreted_by' => ['nullable', 'uuid', 'exists:users,id'],
            'performed_at' => ['required', 'date'],
            'heart_rate' => ['nullable', 'integer', 'min:20', 'max:300'],
            'rhythm' => ['nullable', 'in:sinus,atrial_fibrillation,atrial_flutter,svt,vt,vf,heart_block,paced,other'],
            'pr_interval_ms' => ['nullable', 'integer'],
            'qrs_duration_ms' => ['nullable', 'integer'],
            'qt_interval_ms' => ['nullable', 'integer'],
            'qtc_interval_ms' => ['nullable', 'integer'],
            'axis' => ['nullable', 'in:normal,left_axis_deviation,right_axis_deviation'],
            'st_changes' => ['nullable', 'boolean'],
            'st_notes' => ['nullable', 'string'],
            'interpretation' => ['nullable', 'string'],
            'is_abnormal' => ['nullable', 'boolean'],
        ]);

        $validated['performed_by'] = $authUser->id;

        $ecg = EcgRecord::create($validated);

        return response()->json([
            'data' => $ecg->load(['performedBy:id,first_name,last_name']),
            'message' => 'ECG record created.',
        ], 201);
    }

    public function echos(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cardiology.view')) {
            abort(403);
        }

        $echos = EchoReport::where('patient_id', $patientId)
            ->with(['performedBy:id,first_name,last_name'])
            ->orderByDesc('performed_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $echos->items(),
            'meta' => [
                'total' => $echos->total(),
                'per_page' => $echos->perPage(),
                'current_page' => $echos->currentPage(),
                'last_page' => $echos->lastPage(),
            ],
        ]);
    }

    public function storeEcho(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cardiology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'performed_at' => ['required', 'date'],
            'echo_type' => ['required', 'in:transthoracic,transesophageal,stress,contrast'],
            'ef_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'lv_function' => ['nullable', 'in:normal,mildly_reduced,moderately_reduced,severely_reduced'],
            'wall_motion' => ['nullable', 'in:normal,regional_abnormality,global_hypokinesis'],
            'valvular_findings' => ['nullable', 'string'],
            'pericardial_effusion' => ['nullable', 'boolean'],
            'impression' => ['nullable', 'string'],
        ]);

        $validated['performed_by'] = $authUser->id;

        $echo = EchoReport::create($validated);

        return response()->json([
            'data' => $echo->load(['performedBy:id,first_name,last_name']),
            'message' => 'Echo report created.',
        ], 201);
    }

    public function cathCases(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cardiology.view')) {
            abort(403);
        }

        $cases = CathLabCase::query()
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->with(['patient:id,first_name,last_name,mrn', 'cardiologist:id,first_name,last_name'])
            ->orderByDesc('scheduled_at')
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

    public function storeCathCase(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cardiology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'cardiologist_id' => ['required', 'uuid', 'exists:users,id'],
            'procedure_type' => ['required', 'in:diagnostic_angiogram,pci,pacemaker_implant,ablation,cardioversion,right_heart_cath'],
            'scheduled_at' => ['required', 'date'],
            'access_site' => ['nullable', 'in:femoral,radial,brachial'],
        ]);

        $validated['case_number'] = CathLabCase::generateCaseNumber();
        $validated['status'] = 'scheduled';

        $case = CathLabCase::create($validated);

        return response()->json([
            'data' => $case->load(['patient:id,first_name,last_name,mrn', 'cardiologist:id,first_name,last_name']),
            'message' => 'Cath lab case scheduled.',
        ], 201);
    }

    public function completeCathCase(Request $request, CathLabCase $cathLabCase): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cardiology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'findings' => ['nullable', 'string'],
            'intervention_performed' => ['nullable', 'string'],
            'complications' => ['nullable', 'string'],
            'contrast_volume_ml' => ['nullable', 'integer', 'min:0'],
            'fluoroscopy_time_min' => ['nullable', 'numeric', 'min:0'],
        ]);

        $validated['status'] = 'completed';
        $validated['ended_at'] = now();

        $cathLabCase->update($validated);

        return response()->json([
            'data' => $cathLabCase->fresh(),
            'message' => 'Cath lab case completed.',
        ]);
    }
}
