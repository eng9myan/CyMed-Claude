<?php

namespace Modules\EMR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\EMR\Models\ClinicalNote;
use Modules\Patient\Models\Encounter;

class ClinicalNoteController extends Controller
{
    public function index(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.notes.view', 'patients.view'])) {
            abort(403);
        }

        $notes = ClinicalNote::where('encounter_id', $encounter->id)
            ->with(['author:id,first_name,last_name', 'signedBy:id,first_name,last_name'])
            ->when($request->note_type, fn ($q, $v) => $q->where('note_type', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('authored_at')
            ->get();

        return response()->json(['data' => $notes]);
    }

    public function store(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.notes.create'])) {
            abort(403);
        }

        $validated = $request->validate([
            'note_type' => ['required', 'in:progress,admission,discharge,operative,consult,nursing,er,procedure'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'note_title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'array'],
            'content_text' => ['nullable', 'string'],
            'template_id' => ['nullable', 'uuid', 'exists:note_templates,id'],
        ]);

        $validated['patient_id'] = $encounter->patient_id;
        $validated['encounter_id'] = $encounter->id;
        $validated['authored_by'] = $authUser->id;
        $validated['authored_at'] = now();
        $validated['status'] = 'draft';

        $note = ClinicalNote::create($validated);

        return response()->json([
            'data' => $note->load('author:id,first_name,last_name'),
            'message' => 'Note created.',
        ], 201);
    }

    public function show(Request $request, Encounter $encounter, ClinicalNote $note): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.notes.view', 'patients.view'])) {
            abort(403);
        }

        if ($note->encounter_id !== $encounter->id) {
            abort(404);
        }

        return response()->json([
            'data' => $note->load(['author:id,first_name,last_name', 'signedBy:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, Encounter $encounter, ClinicalNote $note): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.notes.create', 'clinical.notes.amend'])) {
            abort(403);
        }

        if ($note->encounter_id !== $encounter->id) {
            abort(404);
        }

        if ($note->status === 'signed') {
            return response()->json(['message' => 'Signed notes cannot be edited. Create an addendum instead.'], 422);
        }

        $validated = $request->validate([
            'note_title' => ['nullable', 'string', 'max:255'],
            'content' => ['sometimes', 'array'],
            'content_text' => ['nullable', 'string'],
            'specialty' => ['nullable', 'string', 'max:100'],
        ]);

        $note->update($validated);

        return response()->json([
            'data' => $note->fresh(),
            'message' => 'Note updated.',
        ]);
    }

    public function destroy(Encounter $encounter, ClinicalNote $note): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasAnyPermission(['clinical.notes.create'])) {
            abort(403);
        }

        if ($note->encounter_id !== $encounter->id) {
            abort(404);
        }

        if ($note->status !== 'draft') {
            return response()->json(['message' => 'Only draft notes can be deleted.'], 422);
        }

        $note->delete();

        return response()->json(null, 204);
    }

    public function sign(Request $request, Encounter $encounter, ClinicalNote $note): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinical.notes.sign')) {
            abort(403);
        }

        if ($note->encounter_id !== $encounter->id) {
            abort(404);
        }

        if ($note->status !== 'draft') {
            return response()->json(['message' => 'Only draft notes can be signed.'], 422);
        }

        $note->update([
            'status' => 'signed',
            'signed_by' => $authUser->id,
            'signed_at' => now(),
        ]);

        return response()->json([
            'data' => $note->fresh()->load('signedBy:id,first_name,last_name'),
            'message' => 'Note signed.',
        ]);
    }
}
