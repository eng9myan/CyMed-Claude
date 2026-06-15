<?php

namespace Modules\Core\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\WorkflowInstance;
use Modules\Core\Models\WorkflowStepLog;
use Modules\Core\Models\WorkflowTemplate;

class WorkflowController extends Controller
{
    public function templates(Request $request): JsonResponse
    {
        $query = WorkflowTemplate::query()->where('is_active', true);

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        return response()->json(['data' => $query->orderBy('name')->get()]);
    }

    public function createTemplate(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('workflow.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'    => ['required', 'uuid', 'exists:facilities,id'],
            'template_code'  => ['required', 'string', 'max:50', 'unique:workflow_templates,template_code'],
            'name'           => ['required', 'string', 'max:255'],
            'trigger_event'  => ['required', 'string', 'max:100'],
            'steps'          => ['required', 'array'],
            'steps.*.step_name'    => ['required', 'string'],
            'steps.*.action_type'  => ['required', 'string'],
            'steps.*.assigned_role' => ['required', 'string'],
            'steps.*.due_hours'    => ['required', 'integer', 'min:1'],
        ]);

        $template = WorkflowTemplate::create($validated);

        return response()->json([
            'data'    => $template,
            'message' => 'Workflow template created.',
        ], 201);
    }

    public function instances(Request $request): JsonResponse
    {
        $query = WorkflowInstance::query();

        if ($request->has('template_id')) {
            $query->where('template_id', $request->template_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $instances = $query->with('template')
            ->orderByDesc('started_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $instances->items(),
            'meta' => [
                'total'        => $instances->total(),
                'per_page'     => $instances->perPage(),
                'current_page' => $instances->currentPage(),
                'last_page'    => $instances->lastPage(),
            ],
        ]);
    }

    public function startWorkflow(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('workflow.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'template_id' => ['required', 'uuid', 'exists:workflow_templates,id'],
            'entity_type' => ['required', 'string', 'max:100'],
            'entity_id'   => ['required', 'uuid'],
        ]);

        $template = WorkflowTemplate::findOrFail($validated['template_id']);
        $firstStep = $template->steps[0]['step_name'] ?? null;

        $instance = WorkflowInstance::create(array_merge($validated, [
            'current_step' => $firstStep,
            'status'       => 'in_progress',
            'started_at'   => now(),
        ]));

        return response()->json([
            'data'    => $instance,
            'message' => 'Workflow started.',
        ], 201);
    }

    public function completeStep(Request $request, string $instanceId, string $step): JsonResponse
    {
        $authUser = $request->user();

        $instance = WorkflowInstance::findOrFail($instanceId);

        if ($instance->status !== 'in_progress') {
            return response()->json(['message' => 'Workflow is not in progress.'], 422);
        }

        $validated = $request->validate([
            'action_taken' => ['required', 'string', 'max:100'],
            'notes'        => ['nullable', 'string'],
        ]);

        WorkflowStepLog::create(array_merge($validated, [
            'instance_id'  => $instanceId,
            'step_name'    => $step,
            'completed_by' => $authUser->id,
            'completed_at' => now(),
        ]));

        $template = $instance->template;
        $steps = collect($template->steps);
        $currentIndex = $steps->search(fn ($s) => $s['step_name'] === $step);
        $nextStep = $steps->get($currentIndex + 1);

        if ($nextStep) {
            $instance->update(['current_step' => $nextStep['step_name']]);
        } else {
            $instance->update(['status' => 'completed', 'completed_at' => now(), 'current_step' => null]);
        }

        return response()->json([
            'data'    => $instance->fresh(),
            'message' => 'Step completed.',
        ]);
    }
}
