<?php

namespace Modules\Patient\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Patient;
use Modules\Patient\Services\PatientMatchingService;

class PatientMergeController extends Controller
{
    public function __construct(protected PatientMatchingService $matchingService) {}

    public function byMrn(string $mrn): JsonResponse
    {
        $this->authorize('viewAny', Patient::class);

        $patient = Patient::where('mrn', strtoupper($mrn))->with(['facility', 'primaryInsurance'])->firstOrFail();

        return response()->json(['data' => $patient]);
    }

    public function byIdentifier(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Patient::class);

        $validated = $request->validate([
            'type' => ['required', 'in:national_id,iqama_number,passport_number'],
            'value' => ['required', 'string', 'max:30'],
        ]);

        $patient = Patient::active()
            ->where($validated['type'], $validated['value'])
            ->with(['facility', 'primaryInsurance'])
            ->firstOrFail();

        return response()->json(['data' => $patient]);
    }

    public function checkDuplicates(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Patient::class);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date'],
            'national_id' => ['nullable', 'string', 'max:20'],
            'iqama_number' => ['nullable', 'string', 'max:20'],
            'passport_number' => ['nullable', 'string', 'max:20'],
        ]);

        $result = $this->matchingService->findDuplicates($validated);

        return response()->json($result);
    }

    public function duplicates(Request $request, Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        $result = $this->matchingService->findDuplicates([
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'date_of_birth' => $patient->date_of_birth?->toDateString(),
            'national_id' => $patient->national_id,
            'iqama_number' => $patient->iqama_number,
            'passport_number' => $patient->passport_number,
        ], $patient->id);

        return response()->json($result);
    }

    public function merge(Request $request, Patient $patient): JsonResponse
    {
        $this->authorize('merge', $patient);

        $validated = $request->validate([
            'target_patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        if ($validated['target_patient_id'] === $patient->id) {
            return response()->json(['message' => 'Cannot merge a patient into themselves.'], 422);
        }

        $target = Patient::findOrFail($validated['target_patient_id']);

        if ($target->is_merged) {
            return response()->json(['message' => 'Target patient has already been merged.'], 422);
        }

        DB::transaction(function () use ($patient, $target) {
            DB::table('patients')
                ->where('id', $patient->id)
                ->update([
                    'is_merged' => true,
                    'merged_into' => $target->id,
                    'merged_at' => now(),
                    'updated_at' => now(),
                ]);
        });

        return response()->json([
            'message' => 'Patient records merged successfully.',
            'data' => [
                'source_patient_id' => $patient->id,
                'source_mrn' => $patient->mrn,
                'target_patient_id' => $target->id,
                'target_mrn' => $target->mrn,
            ],
        ]);
    }

    public function mergedRecords(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        $merged = Patient::withTrashed()
            ->where('merged_into', $patient->id)
            ->with(['facility'])
            ->get();

        return response()->json(['data' => $merged]);
    }
}
