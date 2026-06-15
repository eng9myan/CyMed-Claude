<?php

namespace Modules\Patient\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Patient\Models\ConsentForm;
use Modules\Patient\Models\Patient;
use Modules\Patient\Models\SignedConsent;

class ConsentController extends Controller
{
    public function forms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $forms = ConsentForm::where('facility_id', $validated['facility_id'])
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        return response()->json(['data' => $forms]);
    }

    public function signConsent(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id'     => ['required', 'uuid', 'exists:patients,id'],
            'form_id'        => ['required', 'uuid', 'exists:consent_forms,id'],
            'encounter_id'   => ['nullable', 'uuid', 'exists:encounters,id'],
            'witness_id'     => ['nullable', 'uuid', 'exists:users,id'],
            'signature_data' => ['required', 'string'],
            'signed_at'      => ['required', 'date'],
        ]);

        $consent = SignedConsent::create(array_merge($validated, [
            'signed_by' => $authUser->id,
        ]));

        return response()->json([
            'data'    => $consent,
            'message' => 'Consent signed.',
        ], 201);
    }

    public function patientConsents(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.view')) {
            abort(403);
        }

        Patient::findOrFail($patientId);

        $consents = SignedConsent::where('patient_id', $patientId)
            ->with('form')
            ->orderByDesc('signed_at')
            ->get();

        return response()->json(['data' => $consents]);
    }
}
