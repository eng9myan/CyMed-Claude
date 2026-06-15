<?php

namespace Modules\Patient\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Patient\Models\SatisfactionSurvey;
use Modules\Patient\Models\SurveyResponse;

class SatisfactionController extends Controller
{
    public function surveys(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('satisfaction.manage')) {
            abort(403);
        }

        $surveys = SatisfactionSurvey::where('is_active', true)->get();

        return response()->json(['data' => $surveys]);
    }

    public function createSurvey(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('satisfaction.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'survey_code' => ['required', 'string', 'max:30', 'unique:satisfaction_surveys,survey_code'],
            'survey_name' => ['required', 'string', 'max:255'],
            'survey_type' => ['required', 'in:inpatient,outpatient,emergency,telemedicine'],
            'questions' => ['required', 'array'],
        ]);

        $survey = SatisfactionSurvey::create($validated);

        return response()->json([
            'data' => $survey,
            'message' => 'Survey created.',
        ], 201);
    }

    public function submitResponse(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'survey_id' => ['required', 'uuid', 'exists:satisfaction_surveys,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid'],
            'answers' => ['required', 'array'],
            'is_anonymous' => ['sometimes', 'boolean'],
            'channel' => ['sometimes', 'in:app,sms,email,kiosk'],
        ]);

        $scores = array_values($validated['answers']);
        $numericScores = array_filter($scores, 'is_numeric');
        $overallScore = count($numericScores) > 0
            ? round(array_sum($numericScores) / count($numericScores), 2)
            : null;

        $response = SurveyResponse::create(array_merge($validated, [
            'overall_score' => $overallScore,
            'channel' => $validated['channel'] ?? 'app',
            'submitted_at' => now(),
        ]));

        return response()->json([
            'data' => $response,
            'message' => 'Survey response submitted.',
        ], 201);
    }

    public function surveyResults(Request $request, string $surveyId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('satisfaction.manage')) {
            abort(403);
        }

        $survey = SatisfactionSurvey::findOrFail($surveyId);
        $responses = SurveyResponse::where('survey_id', $surveyId)
            ->orderByDesc('submitted_at')
            ->paginate((int) ($request->per_page ?? 20));

        $avgScore = SurveyResponse::where('survey_id', $surveyId)
            ->whereNotNull('overall_score')
            ->avg('overall_score');

        return response()->json([
            'survey' => $survey,
            'average_score' => round($avgScore ?? 0, 2),
            'data' => $responses->items(),
            'meta' => [
                'total' => $responses->total(),
                'per_page' => $responses->perPage(),
                'current_page' => $responses->currentPage(),
                'last_page' => $responses->lastPage(),
            ],
        ]);
    }
}
