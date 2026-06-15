<?php

namespace Modules\CareManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CareManagement\Models\MdtMeeting;
use Modules\CareManagement\Models\StructuredCarePlan;

class CareCoordinationController extends Controller
{
    public function mdtMeetings(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $meetings = MdtMeeting::where('patient_id', $validated['patient_id'])
            ->orderByDesc('scheduled_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $meetings->items(),
            'meta' => [
                'total' => $meetings->total(),
                'per_page' => $meetings->perPage(),
                'current_page' => $meetings->currentPage(),
                'last_page' => $meetings->lastPage(),
            ],
        ]);
    }

    public function scheduleMeeting(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'meeting_type' => ['required', 'in:mdt,tumor_board,discharge_planning,care_conference'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['sometimes', 'integer', 'min:15'],
            'agenda' => ['nullable', 'string'],
            'attendee_ids' => ['nullable', 'array'],
            'chaired_by' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $meeting = MdtMeeting::create(array_merge($validated, [
            'attendee_ids' => $validated['attendee_ids'] ?? [],
            'decisions' => [],
        ]));

        return response()->json([
            'data' => $meeting,
            'message' => 'MDT meeting scheduled.',
        ], 201);
    }

    public function recordMeetingOutcome(Request $request, string $meetingId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.update')) {
            abort(403);
        }

        $meeting = MdtMeeting::findOrFail($meetingId);

        $validated = $request->validate([
            'discussion_notes' => ['required', 'string'],
            'decisions' => ['nullable', 'array'],
        ]);

        $meeting->update(array_merge($validated, [
            'decisions' => $validated['decisions'] ?? [],
            'status' => 'completed',
        ]));

        return response()->json(['data' => $meeting->fresh(), 'message' => 'Meeting outcome recorded.']);
    }

    public function carePlans(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $plans = StructuredCarePlan::where('patient_id', $validated['patient_id'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $plans]);
    }

    public function createCarePlan(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('patients.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'plan_type' => ['required', 'in:comprehensive,disease_specific,discharge'],
            'condition' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date'],
            'goals' => ['nullable', 'array'],
            'interventions' => ['nullable', 'array'],
        ]);

        $plan = StructuredCarePlan::create(array_merge($validated, [
            'goals' => $validated['goals'] ?? [],
            'interventions' => $validated['interventions'] ?? [],
            'created_by' => $authUser->id,
        ]));

        return response()->json([
            'data' => $plan,
            'message' => 'Care plan created.',
        ], 201);
    }
}
