<?php

namespace Modules\OperatingTheater\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\OperatingTheater\Models\OtCase;

class OtCaseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['ot.schedule.view', 'ot.schedule.manage', 'ot.notes.create'])) {
            abort(403);
        }

        $cases = OtCase::with(['patient:id,first_name,last_name,mrn', 'surgeon:id,first_name,last_name'])
            ->when($request->date, fn ($q, $v) => $q->whereDate('scheduled_start', $v))
            ->when($request->case_status, fn ($q, $v) => $q->where('case_status', $v))
            ->when($request->surgeon_id, fn ($q, $v) => $q->where('surgeon_id', $v))
            ->orderBy('scheduled_start')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $cases->items(),
            'meta' => [
                'total' => $cases->total(),
                'per_page' => $cases->perPage(),
                'current_page' => $cases->currentPage(),
                'last_page' => $cases->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ot.schedule.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'procedure_name' => ['required', 'string', 'max:255'],
            'procedure_codes' => ['nullable', 'array'],
            'theater_room' => ['nullable', 'string', 'max:20'],
            'scheduled_start' => ['required', 'date'],
            'scheduled_duration_minutes' => ['nullable', 'integer', 'min:15'],
            'anesthesia_type' => ['nullable', 'in:general,regional,local,sedation'],
            'surgeon_id' => ['required', 'uuid', 'exists:users,id'],
            'assistant_surgeon_ids' => ['nullable', 'array'],
            'anesthesiologist_id' => ['nullable', 'uuid', 'exists:users,id'],
            'scrub_nurse_id' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $validated['case_number'] = OtCase::generateCaseNumber();
        $validated['case_status'] = 'scheduled';

        $case = OtCase::create($validated);

        return response()->json([
            'data' => $case->load(['patient:id,first_name,last_name,mrn', 'surgeon:id,first_name,last_name']),
            'message' => 'OT case scheduled.',
        ], 201);
    }

    public function show(Request $request, OtCase $case): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['ot.schedule.view', 'ot.schedule.manage', 'ot.notes.create'])) {
            abort(403);
        }

        return response()->json([
            'data' => $case->load(['patient:id,first_name,last_name,mrn', 'surgeon:id,first_name,last_name', 'anesthesiologist:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, OtCase $case): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['ot.schedule.manage', 'ot.notes.create'])) {
            abort(403);
        }

        $validated = $request->validate([
            'case_status' => ['nullable', 'in:scheduled,in_progress,completed,cancelled,postponed'],
            'theater_room' => ['nullable', 'string', 'max:20'],
            'actual_start' => ['nullable', 'date'],
            'actual_end' => ['nullable', 'date'],
            'pre_op_checklist_done' => ['nullable', 'boolean'],
            'post_op_diagnosis' => ['nullable', 'string', 'max:500'],
            'estimated_blood_loss_ml' => ['nullable', 'integer', 'min:0'],
            'complications' => ['nullable', 'string'],
            'intraop_notes' => ['nullable', 'string'],
            'implants_used' => ['nullable', 'array'],
            'specimens_collected' => ['nullable', 'array'],
        ]);

        $case->update($validated);

        return response()->json([
            'data' => $case->fresh(),
            'message' => 'OT case updated.',
        ]);
    }

    public function destroy(OtCase $case): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('ot.schedule.manage')) {
            abort(403);
        }

        if (! in_array($case->case_status, ['scheduled', 'postponed'])) {
            return response()->json(['message' => 'Only scheduled or postponed cases can be cancelled.'], 422);
        }

        $case->update(['case_status' => 'cancelled']);
        $case->delete();

        return response()->json(null, 204);
    }
}
