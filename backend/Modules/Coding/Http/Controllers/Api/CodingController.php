<?php

namespace Modules\Coding\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Patient\Models\Encounter;

class CodingController extends Controller
{
    public function pendingEncounters(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['coding.assign', 'coding.validate'])) {
            abort(403);
        }

        $encounters = Encounter::with(['patient:id,first_name,last_name,mrn'])
            ->whereNotNull('discharged_at')
            ->where(function ($q) {
                $q->whereNull('primary_diagnosis_code')
                    ->orWhereNull('drg_code');
            })
            ->orderByDesc('discharged_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $encounters->items(),
            'meta' => [
                'total' => $encounters->total(),
                'per_page' => $encounters->perPage(),
                'current_page' => $encounters->currentPage(),
                'last_page' => $encounters->lastPage(),
            ],
        ]);
    }

    public function assign(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('coding.assign')) {
            abort(403);
        }

        $validated = $request->validate([
            'primary_diagnosis_code' => ['required', 'string', 'max:20'],
            'primary_diagnosis_name' => ['required', 'string', 'max:255'],
            'secondary_diagnoses' => ['nullable', 'array'],
            'secondary_diagnoses.*.code' => ['required_with:secondary_diagnoses', 'string', 'max:20'],
            'secondary_diagnoses.*.name' => ['required_with:secondary_diagnoses', 'string'],
            'secondary_diagnoses.*.type' => ['nullable', 'in:complication,comorbidity,other'],
            'drg_code' => ['nullable', 'string', 'max:10'],
            'drg_weight' => ['nullable', 'numeric', 'min:0'],
        ]);

        $encounter->update($validated);

        return response()->json([
            'data' => $encounter->fresh(['patient:id,first_name,last_name,mrn']),
            'message' => 'Coding assigned.',
        ]);
    }

    public function validate(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('coding.validate')) {
            abort(403);
        }

        if (! $encounter->primary_diagnosis_code) {
            return response()->json(['message' => 'Encounter has no diagnosis code assigned.'], 422);
        }

        return response()->json([
            'data' => [
                'encounter_id' => $encounter->id,
                'encounter_number' => $encounter->encounter_number,
                'primary_diagnosis_code' => $encounter->primary_diagnosis_code,
                'primary_diagnosis_name' => $encounter->primary_diagnosis_name,
                'secondary_diagnoses' => $encounter->secondary_diagnoses,
                'drg_code' => $encounter->drg_code,
                'drg_weight' => $encounter->drg_weight,
                'validated_by' => $authUser->id,
                'validated_at' => now()->toIso8601String(),
            ],
            'message' => 'Coding validated.',
        ]);
    }
}
