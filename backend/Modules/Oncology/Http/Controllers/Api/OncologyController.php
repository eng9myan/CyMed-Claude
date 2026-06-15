<?php

namespace Modules\Oncology\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Oncology\Models\ChemotherapyCycle;
use Modules\Oncology\Models\OncologyCase;
use Modules\Oncology\Models\TumorBoardMeeting;

class OncologyController extends Controller
{
    public function cases(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('oncology.view')) {
            abort(403);
        }

        $cases = OncologyCase::query()
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->with([
                'patient:id,first_name,last_name,mrn',
                'primaryOncologist:id,first_name,last_name',
            ])
            ->orderByDesc('created_at')
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

    public function storeCase(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('oncology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'primary_oncologist_id' => ['required', 'uuid', 'exists:users,id'],
            'cancer_type' => ['required', 'string', 'max:100'],
            'icd10_code' => ['nullable', 'string', 'max:10'],
            'histology' => ['nullable', 'string', 'max:100'],
            'stage' => ['nullable', 'in:I,II,III,IV,unknown'],
            'grade' => ['nullable', 'in:G1,G2,G3,G4,GX'],
            'diagnosis_date' => ['required', 'date'],
            'status' => ['nullable', 'in:active,remission,surveillance,palliative,deceased,lost_to_follow_up'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['case_number'] = OncologyCase::generateCaseNumber();
        $validated['status'] = $validated['status'] ?? 'active';

        $case = OncologyCase::create($validated);

        return response()->json([
            'data' => $case->load(['patient:id,first_name,last_name,mrn', 'primaryOncologist:id,first_name,last_name']),
            'message' => 'Oncology case created.',
        ], 201);
    }

    public function cycles(Request $request, OncologyCase $case): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('oncology.view')) {
            abort(403);
        }

        $cycles = ChemotherapyCycle::where('oncology_case_id', $case->id)
            ->with(['administeredBy:id,first_name,last_name'])
            ->orderBy('cycle_number')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $cycles->items(),
            'meta' => [
                'total' => $cycles->total(),
                'per_page' => $cycles->perPage(),
                'current_page' => $cycles->currentPage(),
                'last_page' => $cycles->lastPage(),
            ],
        ]);
    }

    public function storeCycle(Request $request, OncologyCase $case): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('oncology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'protocol_name' => ['required', 'string', 'max:100'],
            'cycle_number' => ['required', 'integer', 'min:1'],
            'total_cycles' => ['nullable', 'integer', 'min:1'],
            'scheduled_date' => ['required', 'date'],
            'pre_medications' => ['nullable', 'array'],
            'drugs' => ['nullable', 'array'],
        ]);

        $validated['oncology_case_id'] = $case->id;
        $validated['patient_id'] = $case->patient_id;
        $validated['status'] = 'scheduled';

        $cycle = ChemotherapyCycle::create($validated);

        return response()->json([
            'data' => $cycle,
            'message' => 'Chemotherapy cycle scheduled.',
        ], 201);
    }

    public function administerCycle(Request $request, ChemotherapyCycle $cycle): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('oncology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'toxicity_grade' => ['nullable', 'integer', 'min:0', 'max:5'],
            'toxicity_notes' => ['nullable', 'string'],
            'next_cycle_date' => ['nullable', 'date'],
        ]);

        $validated['status'] = 'administered';
        $validated['administered_date'] = now()->toDateString();
        $validated['administered_by'] = $authUser->id;

        $cycle->update($validated);

        return response()->json([
            'data' => $cycle->fresh(),
            'message' => 'Chemotherapy cycle administered.',
        ]);
    }

    public function tumorBoard(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('oncology.view')) {
            abort(403);
        }

        $meetings = TumorBoardMeeting::query()
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->when($request->oncology_case_id, fn ($q, $v) => $q->where('oncology_case_id', $v))
            ->with([
                'oncologyCase:id,case_number,cancer_type',
                'recordedBy:id,first_name,last_name',
            ])
            ->orderByDesc('meeting_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $meetings->items(),
            'meta' => [
                'total' => $meetings->total(),
                'per_page' => $meetings->perPage(),
                'current_page' => $meetings->currentPage(),
                'last_page' => $meetings->lastPage(),
            ],
        ]);
    }

    public function storeTumorBoard(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('oncology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'oncology_case_id' => ['required', 'uuid', 'exists:oncology_cases,id'],
            'meeting_date' => ['required', 'date'],
            'attendees' => ['nullable', 'array'],
            'recommendation' => ['nullable', 'string'],
            'treatment_plan' => ['nullable', 'string'],
            'follow_up_date' => ['nullable', 'date'],
        ]);

        $validated['recorded_by'] = $authUser->id;

        $meeting = TumorBoardMeeting::create($validated);

        return response()->json([
            'data' => $meeting->load(['oncologyCase:id,case_number,cancer_type', 'recordedBy:id,first_name,last_name']),
            'message' => 'Tumor board meeting recorded.',
        ], 201);
    }
}
