<?php

namespace Modules\Quality\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Quality\Models\GoliveChecklist;
use Modules\Quality\Models\SystemValidation;

class GoLiveController extends Controller
{
    public function checklists(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('golive.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $checklists = GoliveChecklist::where('facility_id', $validated['facility_id'])
            ->orderBy('phase')
            ->get();

        return response()->json(['data' => $checklists]);
    }

    public function createChecklist(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('golive.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'checklist_name' => ['required', 'string', 'max:100'],
            'phase' => ['required', 'in:preparation,testing,training,golive,post_golive'],
            'items' => ['required', 'array', 'min:1'],
            'target_date' => ['nullable', 'date'],
        ]);

        $totalItems = count($validated['items']);

        $checklist = GoliveChecklist::create(array_merge($validated, [
            'total_items' => $totalItems,
            'completed_items' => 0,
            'completion_percentage' => 0,
            'owner_id' => $authUser->id,
        ]));

        return response()->json([
            'data' => $checklist,
            'message' => 'Go-live checklist created.',
        ], 201);
    }

    public function updateChecklist(Request $request, string $id): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('golive.manage')) {
            abort(403);
        }

        $checklist = GoliveChecklist::findOrFail($id);

        $validated = $request->validate([
            'items' => ['required', 'array'],
            'status' => ['sometimes', 'in:in_progress,completed,blocked'],
        ]);

        $completedItems = count(array_filter($validated['items'], fn($i) => ($i['status'] ?? '') === 'done'));
        $totalItems = count($validated['items']);
        $pct = $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0;

        $checklist->update(array_merge($validated, [
            'total_items' => $totalItems,
            'completed_items' => $completedItems,
            'completion_percentage' => $pct,
        ]));

        return response()->json(['data' => $checklist->fresh(), 'message' => 'Checklist updated.']);
    }

    public function validations(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('golive.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $validations = SystemValidation::where('facility_id', $validated['facility_id'])
            ->orderBy('validation_type')
            ->orderBy('component')
            ->get();

        return response()->json(['data' => $validations]);
    }

    public function recordValidation(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('golive.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'validation_type' => ['required', 'in:data_migration,interface_test,user_acceptance,performance,security'],
            'component' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:pending,passed,failed,skipped'],
            'results' => ['nullable', 'string'],
            'defects' => ['nullable', 'string'],
        ]);

        $validation = SystemValidation::create(array_merge($validated, [
            'validated_by' => $authUser->id,
            'validated_at' => now(),
        ]));

        return response()->json([
            'data' => $validation,
            'message' => 'System validation recorded.',
        ], 201);
    }
}
