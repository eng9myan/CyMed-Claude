<?php

namespace Modules\Dermatology\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Dermatology\Models\PhototherapySession;
use Modules\Dermatology\Models\SkinLesion;

class DermatologyController extends Controller
{
    public function lesions(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dermatology.view')) {
            abort(403);
        }

        $lesions = SkinLesion::where('patient_id', $patientId)
            ->with(['documentedBy:id,first_name,last_name'])
            ->orderByDesc('documented_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $lesions->items(),
            'meta' => [
                'total' => $lesions->total(),
                'per_page' => $lesions->perPage(),
                'current_page' => $lesions->currentPage(),
                'last_page' => $lesions->lastPage(),
            ],
        ]);
    }

    public function storeLesion(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dermatology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'documented_at' => ['required', 'date'],
            'lesion_number' => ['nullable', 'integer', 'min:1'],
            'body_location' => ['required', 'string', 'max:100'],
            'lesion_type' => ['required', 'in:macule,papule,plaque,vesicle,bulla,pustule,nodule,tumor,ulcer,crust,scale,atrophy,other'],
            'size_mm' => ['nullable', 'numeric'],
            'color' => ['nullable', 'string', 'max:50'],
            'border' => ['nullable', 'in:regular,irregular,well_defined,ill_defined'],
            'surface' => ['nullable', 'in:smooth,rough,scaly,crusted,ulcerated'],
            'distribution' => ['nullable', 'in:localized,generalized,dermatomal,linear'],
            'associated_symptoms' => ['nullable', 'string'],
            'clinical_diagnosis' => ['nullable', 'string', 'max:255'],
            'biopsy_taken' => ['nullable', 'boolean'],
            'biopsy_result' => ['nullable', 'string'],
        ]);

        $validated['documented_by'] = $authUser->id;

        $lesion = SkinLesion::create($validated);

        return response()->json([
            'data' => $lesion->load(['documentedBy:id,first_name,last_name']),
            'message' => 'Skin lesion documented.',
        ], 201);
    }

    public function phototherapySessions(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dermatology.view')) {
            abort(403);
        }

        $sessions = PhototherapySession::where('patient_id', $patientId)
            ->with(['administeredBy:id,first_name,last_name'])
            ->orderByDesc('session_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'total' => $sessions->total(),
                'per_page' => $sessions->perPage(),
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }

    public function storePhototherapy(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dermatology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'session_date' => ['required', 'date'],
            'session_number' => ['required', 'integer', 'min:1'],
            'therapy_type' => ['required', 'in:nbuvb,puva,uva1,excimer'],
            'dose_mj_cm2' => ['nullable', 'numeric'],
            'exposure_seconds' => ['nullable', 'integer'],
            'affected_area' => ['nullable', 'string', 'max:50'],
            'response' => ['nullable', 'in:improved,unchanged,worsened'],
            'side_effects' => ['nullable', 'string'],
        ]);

        $validated['administered_by'] = $authUser->id;

        $session = PhototherapySession::create($validated);

        return response()->json([
            'data' => $session->load(['administeredBy:id,first_name,last_name']),
            'message' => 'Phototherapy session recorded.',
        ], 201);
    }
}
