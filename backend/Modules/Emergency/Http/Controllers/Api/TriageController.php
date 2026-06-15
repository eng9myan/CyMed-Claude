<?php

namespace Modules\Emergency\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Emergency\Models\TriageAssessment;

class TriageController extends Controller
{
    public function board(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['emergency.triage.create', 'emergency.board.view'])) {
            abort(403);
        }

        $assessments = TriageAssessment::with([
            'patient:id,first_name,last_name,mrn,date_of_birth',
            'triagedBy:id,first_name,last_name',
        ])
            ->whereDate('triaged_at', today())
            ->orderBy('triage_level')
            ->orderByDesc('triaged_at')
            ->get();

        $summary = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        foreach ($assessments as $a) {
            $summary[$a->triage_level] = ($summary[$a->triage_level] ?? 0) + 1;
        }

        return response()->json([
            'data' => $assessments,
            'summary_by_level' => $summary,
            'total_today' => $assessments->count(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['emergency.triage.create', 'emergency.board.view'])) {
            abort(403);
        }

        $assessments = TriageAssessment::with(['patient:id,first_name,last_name,mrn', 'triagedBy:id,first_name,last_name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->triage_level, fn ($q, $v) => $q->where('triage_level', $v))
            ->orderByDesc('triaged_at')
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

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('emergency.triage.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'triage_system' => ['nullable', 'in:MTS,ESI,CTAS'],
            'triage_level' => ['required', 'integer', 'between:1,5'],
            'triage_category' => ['required', 'in:immediate,very_urgent,urgent,standard,non_urgent'],
            'chief_complaint' => ['required', 'string', 'max:500'],
            'arrival_mode' => ['required', 'in:ambulance,walk_in,wheelchair,stretcher,police'],
            'referred_from' => ['nullable', 'string', 'max:100'],
            'temperature' => ['nullable', 'numeric', 'between:30,45'],
            'heart_rate' => ['nullable', 'integer', 'between:20,300'],
            'respiratory_rate' => ['nullable', 'integer', 'between:4,80'],
            'bp_systolic' => ['nullable', 'integer', 'between:40,300'],
            'bp_diastolic' => ['nullable', 'integer', 'between:20,200'],
            'oxygen_saturation' => ['nullable', 'numeric', 'between:50,100'],
            'gcs' => ['nullable', 'integer', 'between:3,15'],
            'pain_score' => ['nullable', 'integer', 'between:0,10'],
            'weight_kg' => ['nullable', 'numeric', 'min:0'],
            'trauma_mechanism' => ['nullable', 'boolean'],
            'trauma_type' => ['nullable', 'string', 'max:100'],
            'sepsis_suspected' => ['nullable', 'boolean'],
            'stroke_suspected' => ['nullable', 'boolean'],
            'stemi_suspected' => ['nullable', 'boolean'],
            'news2_score' => ['nullable', 'integer'],
            'news2_risk' => ['nullable', 'in:low,medium,high'],
            'assessment_notes' => ['nullable', 'string'],
            'immediate_action_taken' => ['nullable', 'string', 'max:500'],
            'disposition' => ['nullable', 'in:treatment_room,waiting,resus_bay,fast_track'],
        ]);

        $validated['triaged_by'] = $authUser->id;
        $validated['triaged_at'] = now();
        $validated['triage_system'] = $validated['triage_system'] ?? 'MTS';

        $triage = TriageAssessment::create($validated);

        return response()->json([
            'data' => $triage->load(['patient:id,first_name,last_name,mrn', 'triagedBy:id,first_name,last_name']),
            'message' => 'Triage assessment recorded.',
        ], 201);
    }

    public function show(Request $request, TriageAssessment $triage): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['emergency.triage.create', 'emergency.board.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $triage->load(['patient', 'encounter', 'triagedBy:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, TriageAssessment $triage): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('emergency.triage.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'triage_level' => ['nullable', 'integer', 'between:1,5'],
            'triage_category' => ['nullable', 'in:immediate,very_urgent,urgent,standard,non_urgent'],
            'disposition' => ['nullable', 'in:treatment_room,waiting,resus_bay,fast_track'],
            'assessment_notes' => ['nullable', 'string'],
            'news2_score' => ['nullable', 'integer'],
            'news2_risk' => ['nullable', 'in:low,medium,high'],
            'immediate_action_taken' => ['nullable', 'string', 'max:500'],
        ]);

        $triage->update($validated);

        return response()->json([
            'data' => $triage->fresh(),
            'message' => 'Triage updated.',
        ]);
    }

    public function destroy(TriageAssessment $triage): JsonResponse
    {
        abort(405);
    }
}
