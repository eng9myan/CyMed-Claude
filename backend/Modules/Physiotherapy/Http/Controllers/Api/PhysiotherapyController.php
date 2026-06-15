<?php

namespace Modules\Physiotherapy\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Physiotherapy\Models\PhysioAssessment;
use Modules\Physiotherapy\Models\PhysioOutcomeScore;
use Modules\Physiotherapy\Models\PhysioSession;

class PhysiotherapyController extends Controller
{
    public function assessments(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('physio.view')) {
            abort(403);
        }

        $assessments = PhysioAssessment::where('patient_id', $patientId)
            ->with(['therapist:id,first_name,last_name'])
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
        if (! $authUser->hasPermissionTo('physio.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'assessment_date' => ['required', 'date'],
            'referral_diagnosis' => ['nullable', 'string', 'max:255'],
            'chief_complaint' => ['nullable', 'string'],
            'pain_score' => ['nullable', 'integer', 'min:0', 'max:10'],
            'range_of_motion' => ['nullable', 'array'],
            'muscle_strength' => ['nullable', 'array'],
            'functional_limitations' => ['nullable', 'string'],
            'treatment_goals' => ['nullable', 'string'],
            'discharge_criteria' => ['nullable', 'string'],
        ]);

        $validated['therapist_id'] = $authUser->id;

        $assessment = PhysioAssessment::create($validated);

        return response()->json([
            'data' => $assessment->load(['therapist:id,first_name,last_name']),
            'message' => 'Physiotherapy assessment created.',
        ], 201);
    }

    public function sessions(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('physio.view')) {
            abort(403);
        }

        $sessions = PhysioSession::where('patient_id', $patientId)
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

    public function storeSession(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('physio.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'assessment_id' => ['nullable', 'uuid', 'exists:physio_assessments,id'],
            'session_date' => ['required', 'date'],
            'session_number' => ['required', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'interventions' => ['nullable', 'array'],
            'pain_score_pre' => ['nullable', 'integer', 'min:0', 'max:10'],
            'pain_score_post' => ['nullable', 'integer', 'min:0', 'max:10'],
            'patient_response' => ['nullable', 'in:improved,unchanged,worsened'],
            'home_exercise_given' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['therapist_id'] = $authUser->id;

        $session = PhysioSession::create($validated);

        return response()->json([
            'data' => $session->load(['therapist:id,first_name,last_name']),
            'message' => 'Physiotherapy session recorded.',
        ], 201);
    }

    public function outcomeScores(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('physio.view')) {
            abort(403);
        }

        $scores = PhysioOutcomeScore::where('patient_id', $patientId)
            ->with(['scoredBy:id,first_name,last_name'])
            ->orderByDesc('scoring_date')
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

    public function storeOutcomeScore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('physio.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'assessment_id' => ['nullable', 'uuid', 'exists:physio_assessments,id'],
            'scoring_date' => ['required', 'date'],
            'tool' => ['required', 'in:fim,barthel,berg_balance,dash,womac,koos,psfs,other'],
            'total_score' => ['required', 'numeric'],
            'max_score' => ['nullable', 'numeric'],
            'subscores' => ['nullable', 'array'],
            'interpretation' => ['nullable', 'string', 'max:100'],
        ]);

        $validated['scored_by'] = $authUser->id;

        $score = PhysioOutcomeScore::create($validated);

        return response()->json([
            'data' => $score->load(['scoredBy:id,first_name,last_name']),
            'message' => 'Outcome score recorded.',
        ], 201);
    }
}
