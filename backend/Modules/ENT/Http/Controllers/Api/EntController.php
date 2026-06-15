<?php

namespace Modules\ENT\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ENT\Models\Audiogram;
use Modules\ENT\Models\EntExamination;

class EntController extends Controller
{
    public function examinations(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ent.view')) {
            abort(403);
        }

        $exams = EntExamination::where('patient_id', $patientId)
            ->with(['examiner:id,first_name,last_name'])
            ->orderByDesc('exam_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $exams->items(),
            'meta' => [
                'total' => $exams->total(),
                'per_page' => $exams->perPage(),
                'current_page' => $exams->currentPage(),
                'last_page' => $exams->lastPage(),
            ],
        ]);
    }

    public function storeExamination(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ent.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'exam_date' => ['required', 'date'],
            'ear_right' => ['nullable', 'array'],
            'ear_left' => ['nullable', 'array'],
            'nose' => ['nullable', 'array'],
            'throat' => ['nullable', 'array'],
            'hearing_right_db' => ['nullable', 'numeric'],
            'hearing_left_db' => ['nullable', 'numeric'],
            'hearing_classification' => ['nullable', 'in:normal,mild_loss,moderate_loss,severe_loss,profound_loss'],
            'diagnosis' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
        ]);

        $validated['examiner_id'] = $authUser->id;

        $exam = EntExamination::create($validated);

        return response()->json([
            'data' => $exam->load(['examiner:id,first_name,last_name']),
            'message' => 'ENT examination recorded.',
        ], 201);
    }

    public function audiograms(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ent.view')) {
            abort(403);
        }

        $audiograms = Audiogram::where('patient_id', $patientId)
            ->with(['performedBy:id,first_name,last_name'])
            ->orderByDesc('performed_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $audiograms->items(),
            'meta' => [
                'total' => $audiograms->total(),
                'per_page' => $audiograms->perPage(),
                'current_page' => $audiograms->currentPage(),
                'last_page' => $audiograms->lastPage(),
            ],
        ]);
    }

    public function storeAudiogram(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ent.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'performed_at' => ['required', 'date'],
            'test_type' => ['required', 'in:pure_tone,speech,tympanometry,oae,abr'],
            'right_frequencies' => ['nullable', 'array'],
            'left_frequencies' => ['nullable', 'array'],
            'speech_reception_right' => ['nullable', 'numeric'],
            'speech_reception_left' => ['nullable', 'numeric'],
            'tympanogram_type_right' => ['nullable', 'in:A,B,C,Ad,As'],
            'tympanogram_type_left' => ['nullable', 'in:A,B,C,Ad,As'],
            'interpretation' => ['nullable', 'string'],
        ]);

        $validated['performed_by'] = $authUser->id;

        $audiogram = Audiogram::create($validated);

        return response()->json([
            'data' => $audiogram->load(['performedBy:id,first_name,last_name']),
            'message' => 'Audiogram recorded.',
        ], 201);
    }
}
