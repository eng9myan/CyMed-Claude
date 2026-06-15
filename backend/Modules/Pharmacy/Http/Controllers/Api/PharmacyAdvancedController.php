<?php

namespace Modules\Pharmacy\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Pharmacy\Models\PharmacyIntervention;
use Modules\Pharmacy\Models\SmartDispenseLog;

class PharmacyAdvancedController extends Controller
{
    public function dispenseLog(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.dispense')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $logs = SmartDispenseLog::where('patient_id', $validated['patient_id'])
            ->orderByDesc('dispensed_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    public function recordDispense(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.dispense')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'cabinet_id' => ['required', 'string', 'max:50'],
            'drug_name' => ['required', 'string', 'max:255'],
            'quantity_dispensed' => ['required', 'numeric', 'min:0.001'],
            'unit' => ['required', 'string', 'max:20'],
            'dispense_reason' => ['sometimes', 'in:scheduled,prn,emergency_override'],
            'is_overridden' => ['sometimes', 'boolean'],
            'override_reason' => ['nullable', 'string'],
            'lot_number' => ['nullable', 'string', 'max:50'],
            'expiry_date' => ['nullable', 'date'],
        ]);

        $log = SmartDispenseLog::create(array_merge($validated, [
            'nurse_id' => $authUser->id,
            'dispensed_at' => now(),
        ]));

        return response()->json([
            'data' => $log,
            'message' => 'Dispense recorded.',
        ], 201);
    }

    public function interventions(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.verify')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $interventions = PharmacyIntervention::where('patient_id', $validated['patient_id'])
            ->orderByDesc('intervened_at')
            ->get();

        return response()->json(['data' => $interventions]);
    }

    public function recordIntervention(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.verify')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'medication_order_id' => ['nullable', 'uuid'],
            'intervention_type' => ['required', 'in:dose_change,drug_substitution,discontinuation,counseling,allergy_detected'],
            'clinical_issue' => ['required', 'string'],
            'recommendation' => ['required', 'string'],
            'prescriber_id' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $intervention = PharmacyIntervention::create(array_merge($validated, [
            'pharmacist_id' => $authUser->id,
            'intervened_at' => now(),
        ]));

        return response()->json([
            'data' => $intervention,
            'message' => 'Pharmacy intervention recorded.',
        ], 201);
    }

    public function updateInterventionOutcome(Request $request, string $id): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.verify')) {
            abort(403);
        }

        $intervention = PharmacyIntervention::findOrFail($id);

        $validated = $request->validate([
            'outcome' => ['required', 'in:accepted,modified,rejected,no_response'],
        ]);

        $intervention->update($validated);

        return response()->json(['data' => $intervention->fresh(), 'message' => 'Outcome recorded.']);
    }
}
