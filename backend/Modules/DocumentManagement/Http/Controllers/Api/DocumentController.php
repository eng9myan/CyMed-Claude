<?php

namespace Modules\DocumentManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\DocumentManagement\Models\ClinicalDocument;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.view')) {
            abort(403);
        }

        $documents = ClinicalDocument::with(['uploadedBy:id,first_name,last_name', 'signedBy:id,first_name,last_name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->document_type, fn ($q, $v) => $q->where('document_type', $v))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $documents->items(),
            'meta' => [
                'total' => $documents->total(),
                'per_page' => $documents->perPage(),
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.upload')) {
            abort(403);
        }

        $validated = $request->validate([
            'document_type' => ['required', 'in:consent_form,discharge_summary,referral_letter,lab_report,imaging_report,prescription,operative_note,advance_directive,insurance_auth,other'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file_path' => ['required', 'string', 'max:500'],
            'file_name' => ['required', 'string', 'max:255'],
            'file_size' => ['nullable', 'integer'],
            'mime_type' => ['nullable', 'string', 'max:100'],
            'patient_id' => ['nullable', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'is_confidential' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'array'],
            'facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
        ]);

        $validated['document_number'] = ClinicalDocument::generateDocumentNumber();
        $validated['uploaded_by'] = $authUser->id;

        if (empty($validated['facility_id'])) {
            $validated['facility_id'] = $request->input('facility_id') ?? $authUser->facility_id
                ?? \Modules\Core\Models\Facility::first()?->id;
        }

        $document = ClinicalDocument::create($validated);

        return response()->json([
            'data' => $document->load(['uploadedBy:id,first_name,last_name']),
            'message' => 'Document uploaded.',
        ], 201);
    }

    public function show(Request $request, ClinicalDocument $document): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.view')) {
            abort(403);
        }

        return response()->json([
            'data' => $document->load(['uploadedBy', 'signedBy', 'patient', 'encounter']),
        ]);
    }

    public function sign(Request $request, ClinicalDocument $document): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.sign')) {
            abort(403);
        }

        if ($document->is_signed) {
            return response()->json(['message' => 'Document is already signed.'], 422);
        }

        $document->update([
            'is_signed' => true,
            'signed_by' => $authUser->id,
            'signed_at' => now(),
        ]);

        return response()->json([
            'data' => $document->fresh()->load(['signedBy:id,first_name,last_name']),
            'message' => 'Document signed.',
        ]);
    }

    public function destroy(Request $request, ClinicalDocument $document): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.upload')) {
            abort(403);
        }

        $document->delete();

        return response()->json(null, 204);
    }
}
