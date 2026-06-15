<?php

namespace Modules\Patient\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Patient\Models\Patient;
use Modules\Patient\Models\PromsInstrument;
use Modules\Patient\Models\PromsScore;

class PromsController extends Controller
{
    public function instruments(Request $request): JsonResponse
    {
        $instruments = PromsInstrument::where('is_active', true)
            ->orderBy('domain')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $instruments]);
    }

    public function recordScore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id'          => ['required', 'uuid', 'exists:patients,id'],
            'instrument_id'       => ['required', 'uuid', 'exists:proms_instruments,id'],
            'encounter_id'        => ['nullable', 'uuid', 'exists:encounters,id'],
            'score'               => ['required', 'numeric'],
            'subscores'           => ['sometimes', 'array'],
            'administration_mode' => ['sometimes', 'in:patient_reported,clinician_administered'],
            'completed_at'        => ['required', 'date'],
        ]);

        $promsScore = PromsScore::create(array_merge($validated, [
            'recorded_by' => $authUser->id,
        ]));

        return response()->json([
            'data'    => $promsScore,
            'message' => 'PROMS score recorded.',
        ], 201);
    }

    public function patientScores(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.view')) {
            abort(403);
        }

        Patient::findOrFail($patientId);

        $scores = PromsScore::where('patient_id', $patientId)
            ->with('instrument')
            ->orderByDesc('completed_at')
            ->get();

        return response()->json(['data' => $scores]);
    }
}
