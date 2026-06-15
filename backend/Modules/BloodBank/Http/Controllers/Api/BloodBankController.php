<?php

namespace Modules\BloodBank\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\BloodBank\Models\BloodCrossmatch;
use Modules\BloodBank\Models\BloodDonor;
use Modules\BloodBank\Models\BloodTransfusion;
use Modules\BloodBank\Models\BloodUnit;

class BloodBankController extends Controller
{
    public function donors(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('blood_bank.manage')) {
            abort(403);
        }

        $donors = BloodDonor::query()
            ->when($request->blood_group, fn ($q, $v) => $q->where('blood_group', $v))
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $donors->items(),
            'meta' => [
                'total' => $donors->total(),
                'per_page' => $donors->perPage(),
                'current_page' => $donors->currentPage(),
                'last_page' => $donors->lastPage(),
            ],
        ]);
    }

    public function storeDonor(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('blood_bank.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['nullable', 'uuid', 'exists:patients,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'blood_group' => ['required', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'rh_factor' => ['required', 'in:positive,negative'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'date_of_birth' => ['nullable', 'date'],
        ]);

        $validated['donor_number'] = BloodDonor::generateDonorNumber();

        $donor = BloodDonor::create($validated);

        return response()->json([
            'data' => $donor,
            'message' => 'Blood donor registered.',
        ], 201);
    }

    public function units(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['blood_bank.view', 'blood_bank.manage'])) {
            abort(403);
        }

        $units = BloodUnit::query()
            ->when($request->blood_group, fn ($q, $v) => $q->where('blood_group', $v))
            ->when($request->component_type, fn ($q, $v) => $q->where('component_type', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $units->items(),
            'meta' => [
                'total' => $units->total(),
                'per_page' => $units->perPage(),
                'current_page' => $units->currentPage(),
                'last_page' => $units->lastPage(),
            ],
        ]);
    }

    public function storeUnit(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('blood_bank.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'donor_id' => ['nullable', 'uuid', 'exists:blood_donors,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'blood_group' => ['required', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'rh_factor' => ['required', 'in:positive,negative'],
            'component_type' => ['required', 'in:whole_blood,packed_rbc,fresh_frozen_plasma,platelets,cryoprecipitate'],
            'volume_ml' => ['required', 'integer', 'min:1'],
            'collected_at' => ['required', 'date'],
            'expiry_at' => ['required', 'date', 'after:collected_at'],
            'storage_location' => ['nullable', 'string', 'max:100'],
        ]);

        $validated['unit_number'] = BloodUnit::generateUnitNumber();
        $validated['status'] = 'available';

        $unit = BloodUnit::create($validated);

        return response()->json([
            'data' => $unit,
            'message' => 'Blood unit registered.',
        ], 201);
    }

    public function crossmatch(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('blood_bank.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'blood_unit_id' => ['required', 'uuid', 'exists:blood_units,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'reserved_until' => ['nullable', 'date'],
        ]);

        $unit = BloodUnit::findOrFail($validated['blood_unit_id']);

        if ($unit->status !== 'available') {
            return response()->json(['message' => 'Blood unit is not available.'], 422);
        }

        $validated['requested_by'] = $authUser->id;
        $validated['crossmatch_result'] = 'pending';

        $crossmatch = BloodCrossmatch::create($validated);

        $unit->update(['status' => 'reserved']);

        return response()->json([
            'data' => $crossmatch->load(['bloodUnit', 'patient:id,first_name,last_name,mrn', 'requestedBy:id,first_name,last_name']),
            'message' => 'Crossmatch request created and unit reserved.',
        ], 201);
    }

    public function completeCrossmatch(Request $request, BloodCrossmatch $crossmatch): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('blood_bank.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'crossmatch_result' => ['required', 'in:compatible,incompatible'],
        ]);

        $crossmatch->update([
            'crossmatch_result' => $validated['crossmatch_result'],
            'crossmatched_at' => now(),
            'crossmatched_by' => $authUser->id,
        ]);

        if ($validated['crossmatch_result'] === 'incompatible') {
            $crossmatch->bloodUnit->update(['status' => 'available']);
        } else {
            $crossmatch->bloodUnit->update(['status' => 'crossmatched']);
        }

        return response()->json([
            'data' => $crossmatch->fresh()->load(['bloodUnit', 'crossmatchedBy:id,first_name,last_name']),
            'message' => 'Crossmatch completed.',
        ]);
    }

    public function transfuse(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('blood_bank.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'blood_unit_id' => ['required', 'uuid', 'exists:blood_units,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'started_at' => ['nullable', 'date'],
            'volume_transfused_ml' => ['nullable', 'integer', 'min:1'],
            'reaction_observed' => ['nullable', 'boolean'],
            'reaction_notes' => ['nullable', 'string'],
        ]);

        $unit = BloodUnit::findOrFail($validated['blood_unit_id']);

        if (! in_array($unit->status, ['crossmatched', 'available'])) {
            return response()->json(['message' => 'Blood unit is not ready for transfusion.'], 422);
        }

        $validated['administered_by'] = $authUser->id;
        $validated['started_at'] = $validated['started_at'] ?? now();

        $transfusion = BloodTransfusion::create($validated);

        $unit->update(['status' => 'transfused']);

        // Update donor stats if unit has a donor
        if ($unit->donor_id) {
            $donor = $unit->donor;
            $donor->increment('total_donations');
            $donor->update(['last_donation_at' => $transfusion->started_at]);
        }

        return response()->json([
            'data' => $transfusion->load(['bloodUnit', 'patient:id,first_name,last_name,mrn', 'administeredBy:id,first_name,last_name']),
            'message' => 'Transfusion recorded.',
        ], 201);
    }

    public function inventory(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['blood_bank.view', 'blood_bank.manage'])) {
            abort(403);
        }

        $inventory = BloodUnit::where('status', 'available')
            ->selectRaw('blood_group, component_type, COUNT(*) as count, SUM(volume_ml) as total_volume_ml')
            ->groupBy('blood_group', 'component_type')
            ->orderBy('blood_group')
            ->orderBy('component_type')
            ->get();

        return response()->json([
            'data' => $inventory,
            'total_available' => BloodUnit::where('status', 'available')->count(),
        ]);
    }
}
