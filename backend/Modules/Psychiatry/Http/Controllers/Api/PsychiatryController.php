<?php

namespace Modules\Psychiatry\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Psychiatry\Models\PsychiatricAssessment;
use Modules\Psychiatry\Models\PsychiatricScaleScore;
use Modules\Psychiatry\Models\TherapySession;

class PsychiatryController extends Controller
{
    public function assessments(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('psychiatry.view')) {
            abort(403);
        }

        $assessments = PsychiatricAssessment::where('patient_id', $patientId)
            ->with(['clinician:id,first_name,last_name'])
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
        if (! $authUser->hasPermissionTo('psychiatry.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'assessment_date' => ['required', 'date'],
            'assessment_type' => ['required', 'in:initial,follow_up,crisis,discharge'],
            'chief_complaint' => ['nullable', 'string'],
            'presenting_history' => ['nullable', 'string'],
            'mental_status' => ['nullable', 'array'],
            'risk_assessment' => ['nullable', 'array'],
            'risk_assessment.risk_level' => ['nullable', 'in:low,medium,high'],
            'diagnosis_primary' => ['nullable', 'string', 'max:100'],
            'diagnosis_secondary' => ['nullable', 'string', 'max:255'],
            'formulation' => ['nullable', 'string'],
            'treatment_plan' => ['nullable', 'string'],
        ]);

        $validated['clinician_id'] = $authUser->id;

        $assessment = PsychiatricAssessment::create($validated);

        return response()->json([
            'data' => $assessment->load(['clinician:id,first_name,last_name']),
            'message' => 'Psychiatric assessment created.',
        ], 201);
    }

    public function scaleScores(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('psychiatry.view')) {
            abort(403);
        }

        $query = PsychiatricScaleScore::where('patient_id', $patientId)
            ->with(['assessedBy:id,first_name,last_name']);

        if ($request->has('scale')) {
            $query->where('scale', $request->scale);
        }

        $scores = $query->orderByDesc('scored_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $scores->items(),
            'meta' => [
                'total' => $scores->total(),
                'per_page' => $scores->perPage(),
                'current_page' => $scores->currentPage(),
                'last_page' => $scores->lastPage(),
            ],
        ]);
    }

    public function storeScaleScore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('psychiatry.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'scored_at' => ['required', 'date'],
            'scale' => ['required', 'in:phq9,gad7,mmse,moca,ham_d,bprs,panss,audit,dast,other'],
            'total_score' => ['required', 'numeric'],
            'severity' => ['nullable', 'in:minimal,mild,moderate,moderately_severe,severe'],
            'item_scores' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['assessed_by'] = $authUser->id;

        // Auto-set severity based on scale-specific ranges
        if (empty($validated['severity'])) {
            $validated['severity'] = $this->calculateSeverity($validated['scale'], (float) $validated['total_score']);
        }

        $score = PsychiatricScaleScore::create($validated);

        return response()->json([
            'data' => $score->load(['assessedBy:id,first_name,last_name']),
            'message' => 'Scale score recorded.',
        ], 201);
    }

    public function therapySessions(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('psychiatry.view')) {
            abort(403);
        }

        $sessions = TherapySession::where('patient_id', $patientId)
            ->with(['therapist:id,first_name,last_name'])
            ->orderByDesc('session_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'total' => $sessions->total(),
                'per_page' => $sessions->perPage(),
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }

    public function storeTherapySession(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('psychiatry.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'session_date' => ['required', 'date'],
            'session_type' => ['required', 'in:individual,group,family,cbt,dbt,emdr,supportive,psychoeducation'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'session_number' => ['nullable', 'integer', 'min:1'],
            'mood_rating' => ['nullable', 'integer', 'min:1', 'max:10'],
            'progress_notes' => ['nullable', 'string'],
            'homework_assigned' => ['nullable', 'string'],
            'risk_update' => ['nullable', 'in:stable,improved,deteriorated,new_concern'],
        ]);

        $validated['therapist_id'] = $authUser->id;

        $session = TherapySession::create($validated);

        return response()->json([
            'data' => $session->load(['therapist:id,first_name,last_name']),
            'message' => 'Therapy session recorded.',
        ], 201);
    }

    /**
     * Calculate severity based on validated scale-specific scoring ranges.
     * PHQ-9: 0-4=minimal, 5-9=mild, 10-14=moderate, 15-19=moderately_severe, 20-27=severe
     * GAD-7: 0-4=minimal, 5-9=mild, 10-14=moderate, 15-21=severe
     */
    private function calculateSeverity(string $scale, float $score): ?string
    {
        if ($scale === 'phq9') {
            if ($score <= 4) return 'minimal';
            if ($score <= 9) return 'mild';
            if ($score <= 14) return 'moderate';
            if ($score <= 19) return 'moderately_severe';
            return 'severe';
        }

        if ($scale === 'gad7') {
            if ($score <= 4) return 'minimal';
            if ($score <= 9) return 'mild';
            if ($score <= 14) return 'moderate';
            return 'severe';
        }

        return null;
    }
}
