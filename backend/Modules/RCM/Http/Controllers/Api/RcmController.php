<?php

namespace Modules\RCM\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\RCM\Models\InsuranceClaim;

class RcmController extends Controller
{
    public function claims(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rcm.claims.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $claims = InsuranceClaim::where('facility_id', $validated['facility_id'])
            ->paginate(20);

        return response()->json($claims);
    }

    public function submitClaim(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rcm.claims.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'      => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id'       => ['nullable', 'uuid', 'exists:patients,id'],
            'encounter_id'     => ['nullable', 'uuid', 'exists:encounters,id'],
            'insurer_id'       => ['required', 'uuid', 'exists:insurers,id'],
            'diagnosis_codes'  => ['required', 'array'],
            'procedure_codes'  => ['required', 'array'],
            'billed_amount'    => ['required', 'numeric', 'min:0'],
        ]);

        // Generate claim_number: CLM-{year}-{seq5}
        $year = now()->year;
        $maxClaim = InsuranceClaim::where('claim_number', 'like', "CLM-{$year}-%")
            ->orderBy('claim_number', 'desc')
            ->first();

        $seq = 1;
        if ($maxClaim) {
            $parts = explode('-', $maxClaim->claim_number);
            $seq = ((int) end($parts)) + 1;
        }

        $claimNumber = sprintf('CLM-%s-%05d', $year, $seq);

        $claim = InsuranceClaim::create(array_merge($validated, [
            'claim_number' => $claimNumber,
            'status'       => 'pending',
        ]));

        return response()->json($claim, 201);
    }

    public function adjudicate(Request $request, InsuranceClaim $insuranceClaim): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rcm.claims.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'allowed_amount' => ['required', 'numeric', 'min:0'],
            'paid_amount'    => ['nullable', 'numeric', 'min:0'],
            'status'         => ['required', 'in:adjudicated,denied'],
        ]);

        $insuranceClaim->update(array_merge($validated, [
            'adjudicated_at' => now(),
        ]));

        return response()->json($insuranceClaim);
    }

    public function appeal(Request $request, InsuranceClaim $insuranceClaim): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rcm.claims.view')) {
            abort(403);
        }

        $insuranceClaim->update(['status' => 'appealed']);

        return response()->json(['message' => 'Claim appealed.', 'claim' => $insuranceClaim]);
    }

    public function arAging(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rcm.claims.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $claims = InsuranceClaim::where('facility_id', $validated['facility_id'])
            ->whereNotIn('status', ['adjudicated', 'paid'])
            ->paginate(20);

        return response()->json($claims);
    }
}
