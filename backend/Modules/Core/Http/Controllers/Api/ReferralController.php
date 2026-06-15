<?php

namespace Modules\Core\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\SpecialtyReferral;

class ReferralController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('referrals.view')) {
            abort(403);
        }

        $query = SpecialtyReferral::query()
            ->with(['patient:id,first_name,last_name,mrn', 'referringProvider:id,first_name,last_name']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('specialty')) {
            $query->where('referred_to_specialty', $request->specialty);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $referrals = $query->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $referrals->items(),
            'meta' => [
                'total' => $referrals->total(),
                'per_page' => $referrals->perPage(),
                'current_page' => $referrals->currentPage(),
                'last_page' => $referrals->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('referrals.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'referred_to_specialty' => ['required', 'in:cardiology,oncology,nephrology,orthopedics,psychiatry,ophthalmology,ent,dermatology,physiotherapy,neurology,gastroenterology,other'],
            'referred_to_provider_id' => ['nullable', 'uuid', 'exists:users,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'urgency' => ['required', 'in:routine,urgent,emergency'],
            'reason' => ['required', 'string'],
            'clinical_notes' => ['nullable', 'string'],
        ]);

        $validated['referring_provider_id'] = $authUser->id;
        $validated['referral_number'] = SpecialtyReferral::generateReferralNumber();
        $validated['status'] = 'pending';

        $referral = SpecialtyReferral::create($validated);

        return response()->json([
            'data' => $referral->load(['patient:id,first_name,last_name,mrn', 'referringProvider:id,first_name,last_name']),
            'message' => 'Referral created.',
        ], 201);
    }

    public function accept(Request $request, SpecialtyReferral $referral): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('referrals.manage')) {
            abort(403);
        }

        $referral->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return response()->json([
            'data' => $referral->fresh(),
            'message' => 'Referral accepted.',
        ]);
    }

    public function complete(Request $request, SpecialtyReferral $referral): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('referrals.manage')) {
            abort(403);
        }

        $referral->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'data' => $referral->fresh(),
            'message' => 'Referral completed.',
        ]);
    }

    public function patientReferrals(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('referrals.view')) {
            abort(403);
        }

        $referrals = SpecialtyReferral::where('patient_id', $patientId)
            ->with(['referringProvider:id,first_name,last_name', 'referredToProvider:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $referrals->items(),
            'meta' => [
                'total' => $referrals->total(),
                'per_page' => $referrals->perPage(),
                'current_page' => $referrals->currentPage(),
                'last_page' => $referrals->lastPage(),
            ],
        ]);
    }
}
