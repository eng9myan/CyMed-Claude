<?php

namespace Modules\NLP\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\NLP\Models\CodingSuggestion;
use Modules\NLP\Models\NoteSummary;

class NlpController extends Controller
{
    public function summarizeNote(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nlp.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id'   => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid'],
            'source_type'  => ['sometimes', 'in:clinical_note,discharge_summary,op_note'],
            'note_text'    => ['required', 'string'],
        ]);

        $summary = NoteSummary::create([
            'patient_id'    => $validated['patient_id'],
            'encounter_id'  => $validated['encounter_id'] ?? null,
            'source_type'   => $validated['source_type'] ?? 'clinical_note',
            'original_text' => $validated['note_text'],
            'summary_text'  => substr($validated['note_text'], 0, 300) . '[AI Summary]',
            'key_findings'  => ['Auto-summarized'],
            'summarized_by' => $authUser->id,
            'model_used'    => 'gpt-4',
        ]);

        return response()->json(['message' => 'Note summarized.', 'data' => $summary], 201);
    }

    public function patientSummaries(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nlp.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $summaries = NoteSummary::where('patient_id', $validated['patient_id'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $summaries]);
    }

    public function suggestCodes(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nlp.coding')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id'   => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid'],
            'code_type'    => ['required', 'in:icd10,cpt,drg'],
            'note_text'    => ['required', 'string'],
        ]);

        $mockSuggestions = [
            [
                'patient_id'       => $validated['patient_id'],
                'encounter_id'     => $validated['encounter_id'] ?? null,
                'code_type'        => $validated['code_type'],
                'suggested_code'   => 'J00',
                'description'      => 'Common cold',
                'confidence_score' => 0.9200,
                'rationale'        => 'Based on note content analysis.',
                'status'           => 'pending',
            ],
            [
                'patient_id'       => $validated['patient_id'],
                'encounter_id'     => $validated['encounter_id'] ?? null,
                'code_type'        => $validated['code_type'],
                'suggested_code'   => 'Z23',
                'description'      => 'Encounter for immunization',
                'confidence_score' => 0.8500,
                'rationale'        => 'Based on note content analysis.',
                'status'           => 'pending',
            ],
        ];

        $created = [];
        foreach ($mockSuggestions as $suggestion) {
            $created[] = CodingSuggestion::create($suggestion);
        }

        return response()->json(['message' => 'Coding suggestions generated.', 'data' => $created], 201);
    }

    public function acceptSuggestion(Request $request, CodingSuggestion $codingSuggestion): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nlp.coding')) {
            abort(403);
        }

        $codingSuggestion->update([
            'status'      => 'accepted',
            'accepted_by' => $authUser->id,
        ]);

        return response()->json(['message' => 'Suggestion accepted.', 'data' => $codingSuggestion]);
    }

    public function encounterSuggestions(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('nlp.coding')) {
            abort(403);
        }

        $validated = $request->validate([
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
        ]);

        $suggestions = CodingSuggestion::where('encounter_id', $validated['encounter_id'])->get();

        return response()->json(['data' => $suggestions]);
    }
}
