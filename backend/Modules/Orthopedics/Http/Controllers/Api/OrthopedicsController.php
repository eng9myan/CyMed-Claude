<?php

namespace Modules\Orthopedics\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Orthopedics\Models\OrthoAssessment;
use Modules\Orthopedics\Models\OrthoImplant;

class OrthopedicsController extends Controller
{
    public function assessments(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('orthopedics.view')) {
            abort(403);
        }

        $assessments = OrthoAssessment::where('patient_id', $patientId)
            ->with(['surgeon:id,first_name,last_name'])
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

    public function storeAssessment(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('orthopedics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'assessment_date' => ['required', 'date'],
            'presenting_complaint' => ['nullable', 'string'],
            'fracture_classification' => ['nullable', 'string', 'max:100'],
            'affected_region' => ['required', 'in:spine,upper_limb,lower_limb,pelvis,hand,foot,other'],
            'laterality' => ['nullable', 'in:right,left,bilateral'],
            'imaging_findings' => ['nullable', 'string'],
            'neurovascular_status' => ['nullable', 'in:intact,compromised,absent'],
            'range_of_motion' => ['nullable', 'array'],
            'management_plan' => ['required', 'in:conservative,surgical,physiotherapy,observation'],
            'surgery_required' => ['nullable', 'boolean'],
        ]);

        $validated['surgeon_id'] = $authUser->id;

        $assessment = OrthoAssessment::create($validated);

        return response()->json([
            'data' => $assessment->load(['surgeon:id,first_name,last_name']),
            'message' => 'Orthopedic assessment recorded.',
        ], 201);
    }

    public function implants(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('orthopedics.view')) {
            abort(403);
        }

        $implants = OrthoImplant::where('patient_id', $patientId)
            ->with(['surgeon:id,first_name,last_name'])
            ->orderByDesc('implant_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $implants->items(),
            'meta' => [
                'total' => $implants->total(),
                'per_page' => $implants->perPage(),
                'current_page' => $implants->currentPage(),
                'last_page' => $implants->lastPage(),
            ],
        ]);
    }

    public function storeImplant(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('orthopedics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'implant_date' => ['required', 'date'],
            'implant_type' => ['required', 'in:total_hip,total_knee,shoulder,spine_cage,plate,nail,screw,external_fixator,other'],
            'manufacturer' => ['nullable', 'string', 'max:100'],
            'product_name' => ['nullable', 'string', 'max:100'],
            'lot_number' => ['nullable', 'string', 'max:50'],
            'serial_number' => ['nullable', 'string', 'max:50'],
            'implant_site' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['surgeon_id'] = $authUser->id;

        $implant = OrthoImplant::create($validated);

        return response()->json([
            'data' => $implant->load(['surgeon:id,first_name,last_name']),
            'message' => 'Implant record created.',
        ], 201);
    }
}
