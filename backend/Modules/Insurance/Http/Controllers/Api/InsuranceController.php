<?php

namespace Modules\Insurance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Nphies\NphiesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Patient\Models\PatientInsurance;

class InsuranceController extends Controller
{
    public function __construct(private readonly NphiesService $nphies) {}

    public function verifyEligibility(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('insurance.eligibility.verify')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id'  => ['required', 'uuid', 'exists:patients,id'],
            'insurance_id' => ['required', 'uuid', 'exists:patient_insurances,id'],
            'service_date' => ['nullable', 'date'],
        ]);

        $insurance = PatientInsurance::with(['patient', 'insurer'])->findOrFail($validated['insurance_id']);
        $patient   = $insurance->patient;

        $result = $this->nphies->checkEligibility([
            'patient_id'          => $validated['patient_id'],
            'patient_national_id' => $patient->national_id ?? $patient->id,
            'member_id'           => $insurance->member_id ?? '',
            'policy_number'       => $insurance->policy_number ?? '',
            'insurer_id'          => $insurance->insurer_id,
            'service_date'        => $validated['service_date'] ?? now()->toDateString(),
            'coverage_type'       => $insurance->coverage_type ?? 'comprehensive',
        ]);

        return response()->json([
            'data'    => array_merge($result, [
                'patient_id'   => $validated['patient_id'],
                'insurance_id' => $validated['insurance_id'],
                'member_id'    => $insurance->member_id,
                'policy_number' => $insurance->policy_number,
                'valid_from'   => $insurance->valid_from,
                'valid_to'     => $insurance->valid_to,
            ]),
            'message' => 'Eligibility verified via NPHIES.',
        ]);
    }
}
