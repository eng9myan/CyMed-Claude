<?php

namespace Modules\Academic\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academic\Models\CaseLog;
use Modules\Academic\Models\CompetencyAssessment;

class MedicalEducationController extends Controller
{
    public function assessments(Request $request, string $traineeId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('education.view')) {
            abort(403);
        }

        $assessments = CompetencyAssessment::where('trainee_id', $traineeId)
            ->with([
                'assessor:id,first_name,last_name',
                'rotation:id,department,rotation_type',
            ])
            ->orderByDesc('assessment_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $assessments->items(),
            'meta' => [
                'total' => $assessments->total(),
                'per_page' => $assessments->perPage(),
                'current_page' => $assessments->currentPage(),
                'last_page' => $assessments->lastPage(),
            ],
        ]);
    }

    public function storeAssessment(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('education.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'trainee_id' => ['required', 'uuid', 'exists:users,id'],
            'rotation_id' => ['nullable', 'uuid', 'exists:medical_rotations,id'],
            'assessment_date' => ['required', 'date'],
            'assessment_tool' => ['required', 'in:mini_cex,dops,cbd,multisource,osce,direct_observation'],
            'competency_domain' => ['required', 'in:medical_knowledge,clinical_skills,professionalism,communication,collaboration,health_advocacy,scholarship'],
            'performance_level' => ['required', 'integer', 'min:1', 'max:5'],
            'feedback' => ['nullable', 'string'],
            'is_shared_with_trainee' => ['nullable', 'boolean'],
        ]);

        $validated['assessor_id'] = $authUser->id;

        $assessment = CompetencyAssessment::create($validated);

        return response()->json([
            'data' => $assessment->load(['trainee:id,first_name,last_name', 'assessor:id,first_name,last_name']),
            'message' => 'Assessment recorded.',
        ], 201);
    }

    public function caseLogs(Request $request, string $traineeId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('education.view')) {
            abort(403);
        }

        $logs = CaseLog::where('trainee_id', $traineeId)
            ->with(['supervisor:id,first_name,last_name'])
            ->orderByDesc('logged_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    public function storeCaseLog(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'supervisor_id' => ['nullable', 'uuid', 'exists:users,id'],
            'logged_date' => ['required', 'date'],
            'patient_age_group' => ['required', 'in:neonate,infant,child,adolescent,adult,elderly'],
            'encounter_type' => ['required', 'in:inpatient,outpatient,emergency,procedure,surgery'],
            'primary_diagnosis' => ['required', 'string', 'max:255'],
            'procedures_performed' => ['nullable', 'array'],
            'role' => ['required', 'in:observer,assisted,performed,supervised'],
        ]);

        $validated['trainee_id'] = $authUser->id;

        $caseLog = CaseLog::create($validated);

        return response()->json([
            'data' => $caseLog->load(['supervisor:id,first_name,last_name']),
            'message' => 'Case log recorded.',
        ], 201);
    }

    public function verifyCaseLog(Request $request, CaseLog $caseLog): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('education.manage')) {
            abort(403);
        }

        $caseLog->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return response()->json([
            'data' => $caseLog->fresh(),
            'message' => 'Case log verified.',
        ]);
    }
}
