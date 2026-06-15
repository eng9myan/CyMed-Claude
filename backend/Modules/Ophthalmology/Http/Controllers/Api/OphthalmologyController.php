<?php

namespace Modules\Ophthalmology\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Ophthalmology\Models\EyeExamination;
use Modules\Ophthalmology\Models\OphthalmicProcedure;

class OphthalmologyController extends Controller
{
    public function examinations(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ophthalmology.view')) {
            abort(403);
        }

        $examinations = EyeExamination::where('patient_id', $patientId)
            ->with(['examiner:id,first_name,last_name'])
            ->orderByDesc('exam_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $examinations->items(),
            'meta' => [
                'total' => $examinations->total(),
                'per_page' => $examinations->perPage(),
                'current_page' => $examinations->currentPage(),
                'last_page' => $examinations->lastPage(),
            ],
        ]);
    }

    public function storeExamination(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ophthalmology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'exam_date' => ['required', 'date'],
            'va_right_unaided' => ['nullable', 'string', 'max:10'],
            'va_left_unaided' => ['nullable', 'string', 'max:10'],
            'va_right_corrected' => ['nullable', 'string', 'max:10'],
            'va_left_corrected' => ['nullable', 'string', 'max:10'],
            'iop_right_mmhg' => ['nullable', 'numeric'],
            'iop_left_mmhg' => ['nullable', 'numeric'],
            'refraction_right' => ['nullable', 'array'],
            'refraction_left' => ['nullable', 'array'],
            'anterior_segment_right' => ['nullable', 'string'],
            'anterior_segment_left' => ['nullable', 'string'],
            'posterior_segment_right' => ['nullable', 'string'],
            'posterior_segment_left' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
        ]);

        $validated['examiner_id'] = $authUser->id;

        $examination = EyeExamination::create($validated);

        return response()->json([
            'data' => $examination->load(['examiner:id,first_name,last_name']),
            'message' => 'Eye examination recorded.',
        ], 201);
    }

    public function procedures(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ophthalmology.view')) {
            abort(403);
        }

        $procedures = OphthalmicProcedure::where('patient_id', $patientId)
            ->with(['surgeon:id,first_name,last_name'])
            ->orderByDesc('procedure_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $procedures->items(),
            'meta' => [
                'total' => $procedures->total(),
                'per_page' => $procedures->perPage(),
                'current_page' => $procedures->currentPage(),
                'last_page' => $procedures->lastPage(),
            ],
        ]);
    }

    public function storeProcedure(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ophthalmology.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'procedure_date' => ['required', 'date'],
            'eye' => ['required', 'in:right,left,both'],
            'procedure_type' => ['required', 'in:cataract_surgery,laser_refractive,intravitreal_injection,vitrectomy,trabeculectomy,strabismus,pterygium,other'],
            'lens_type' => ['nullable', 'string', 'max:50'],
            'complications' => ['nullable', 'string'],
            'postop_va' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['surgeon_id'] = $authUser->id;

        $procedure = OphthalmicProcedure::create($validated);

        return response()->json([
            'data' => $procedure->load(['surgeon:id,first_name,last_name']),
            'message' => 'Ophthalmic procedure recorded.',
        ], 201);
    }
}
