<?php

namespace Modules\Pediatrics\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Pediatrics\Models\DevelopmentalAssessment;
use Modules\Pediatrics\Models\GrowthRecord;
use Modules\Pediatrics\Models\ImmunizationRecord;

class PediatricsController extends Controller
{
    public function growthRecords(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pediatrics.view')) {
            abort(403);
        }

        $records = GrowthRecord::where('patient_id', $patientId)
            ->with(['recordedBy:id,first_name,last_name'])
            ->orderByDesc('recorded_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $records->items(),
            'meta' => [
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
            ],
        ]);
    }

    public function storeGrowthRecord(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pediatrics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'recorded_at' => ['required', 'date'],
            'age_months' => ['nullable', 'integer', 'min:0', 'max:216'],
            'weight_kg' => ['nullable', 'numeric', 'min:0.5', 'max:200'],
            'height_cm' => ['nullable', 'numeric', 'min:20', 'max:250'],
            'head_circumference_cm' => ['nullable', 'numeric', 'min:10', 'max:80'],
            'weight_percentile' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'height_percentile' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'hc_percentile' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nutritional_status' => ['nullable', 'in:normal,underweight,overweight,obese,wasted,stunted'],
        ]);

        // Auto-compute BMI if weight and height provided
        if (isset($validated['weight_kg']) && isset($validated['height_cm']) && $validated['height_cm'] > 0) {
            $heightM = $validated['height_cm'] / 100;
            $validated['bmi'] = round($validated['weight_kg'] / ($heightM * $heightM), 2);
        }

        $validated['recorded_by'] = $authUser->id;

        $record = GrowthRecord::create($validated);

        return response()->json([
            'data' => $record->load(['recordedBy:id,first_name,last_name']),
            'message' => 'Growth record saved.',
        ], 201);
    }

    public function immunizations(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pediatrics.view')) {
            abort(403);
        }

        $records = ImmunizationRecord::where('patient_id', $patientId)
            ->with(['administeredBy:id,first_name,last_name'])
            ->orderByDesc('administered_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $records->items(),
            'meta' => [
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
            ],
        ]);
    }

    public function storeImmunization(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pediatrics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'vaccine_name' => ['required', 'string', 'max:100'],
            'vaccine_code' => ['nullable', 'string', 'max:20'],
            'dose_number' => ['required', 'integer', 'min:1'],
            'lot_number' => ['nullable', 'string', 'max:50'],
            'manufacturer' => ['nullable', 'string', 'max:100'],
            'administered_at' => ['required', 'date'],
            'site' => ['nullable', 'in:left_arm,right_arm,left_thigh,right_thigh,oral'],
            'route' => ['nullable', 'in:im,sc,oral,intradermal'],
            'next_due_date' => ['nullable', 'date'],
            'adverse_reaction' => ['nullable', 'string'],
        ]);

        $validated['administered_by'] = $authUser->id;

        $record = ImmunizationRecord::create($validated);

        return response()->json([
            'data' => $record->load(['administeredBy:id,first_name,last_name']),
            'message' => 'Immunization recorded.',
        ], 201);
    }

    public function developmentalAssessments(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pediatrics.view')) {
            abort(403);
        }

        $assessments = DevelopmentalAssessment::where('patient_id', $patientId)
            ->with(['assessedBy:id,first_name,last_name'])
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

    public function storeDevelopmentalAssessment(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pediatrics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'assessment_date' => ['required', 'date'],
            'age_months' => ['nullable', 'integer', 'min:0', 'max:216'],
            'gross_motor' => ['nullable', 'in:achieved,not_achieved,not_assessed'],
            'fine_motor' => ['nullable', 'in:achieved,not_achieved,not_assessed'],
            'language' => ['nullable', 'in:achieved,not_achieved,not_assessed'],
            'social_emotional' => ['nullable', 'in:achieved,not_achieved,not_assessed'],
            'cognitive' => ['nullable', 'in:achieved,not_achieved,not_assessed'],
            'concerns' => ['nullable', 'string'],
            'referral_needed' => ['nullable', 'boolean'],
        ]);

        $validated['assessed_by'] = $authUser->id;

        $assessment = DevelopmentalAssessment::create($validated);

        return response()->json([
            'data' => $assessment->load(['assessedBy:id,first_name,last_name']),
            'message' => 'Developmental assessment recorded.',
        ], 201);
    }

    public function immunizationSchedule(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pediatrics.view')) {
            abort(403);
        }

        $given = ImmunizationRecord::where('patient_id', $patientId)
            ->orderBy('vaccine_name')
            ->orderBy('dose_number')
            ->get(['vaccine_name', 'dose_number', 'administered_at', 'next_due_date'])
            ->groupBy('vaccine_name');

        $schedule = [];
        foreach ($given as $vaccineName => $doses) {
            $schedule[] = [
                'vaccine_name' => $vaccineName,
                'doses_given' => $doses->map(fn ($d) => [
                    'dose_number' => $d->dose_number,
                    'administered_at' => $d->administered_at,
                    'next_due_date' => $d->next_due_date,
                ]),
            ];
        }

        return response()->json(['data' => $schedule]);
    }
}
