<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AI\ClinicalAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(protected ClinicalAIService $aiService) {}

    public function drugInteractions(Request $request): JsonResponse
    {
        $request->validate([
            'current_medications' => 'required|array',
            'new_drug' => 'required|array',
            'new_drug.drug_name' => 'required|string',
        ]);

        $interactions = $this->aiService->checkDrugInteractions(
            $request->current_medications,
            $request->new_drug
        );

        return response()->json([
            'interactions' => $interactions,
            'checked_at' => now()->toIso8601String(),
            'is_ai_assisted' => ! empty(env('ANTHROPIC_API_KEY')),
        ]);
    }

    public function suggestIcd(Request $request): JsonResponse
    {
        $request->validate(['clinical_text' => 'required|string|min:10']);

        $codes = $this->aiService->suggestIcdCodes($request->clinical_text);

        return response()->json([
            'suggestions' => $codes,
            'coding_system' => 'ICD-11',
        ]);
    }

    public function calculateNews2(Request $request): JsonResponse
    {
        $request->validate(['vitals' => 'required|array']);

        $result = $this->aiService->calculateNews2Score($request->vitals);

        return response()->json($result);
    }

    public function generateDischargeSummary(Request $request): JsonResponse
    {
        $request->validate([
            'encounter_id' => 'required|string',
        ]);

        return response()->json([
            'summary' => 'AI discharge summary generation requires encounter data.',
            'ai_model' => config('cymed.ai.model'),
        ]);
    }

    public function differentialDiagnosis(Request $request): JsonResponse
    {
        $request->validate([
            'chief_complaint' => 'required|string',
            'symptoms' => 'array',
            'vitals' => 'array',
            'patient_age' => 'integer',
            'patient_gender' => 'string',
        ]);

        return response()->json([
            'differentials' => [],
            'message' => 'Differential diagnosis AI requires ANTHROPIC_API_KEY configuration',
        ]);
    }
}
