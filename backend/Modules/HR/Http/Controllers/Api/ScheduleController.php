<?php

namespace Modules\HR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\HR\Models\WorkSchedule;

class ScheduleController extends Controller
{
    public function index(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['view-users', 'hr.staff.view', 'manage-users'])) {
            abort(403);
        }

        $schedules = WorkSchedule::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json(['data' => $schedules]);
    }

    public function store(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            abort(403);
        }

        $validated = $request->validate([
            'schedule_type' => ['required', 'in:regular,on_call,overtime,shift'],
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'effective_from' => ['required', 'date'],
            'effective_until' => ['nullable', 'date'],
            'facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
            'department_id' => ['nullable', 'uuid', 'exists:departments,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $schedule = WorkSchedule::create(array_merge($validated, ['user_id' => $user->id]));

        return response()->json(['data' => $schedule, 'message' => 'Schedule created.'], 201);
    }

    public function destroy(Request $request, User $user, string $schedule): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            abort(403);
        }

        $entry = WorkSchedule::where('user_id', $user->id)->findOrFail($schedule);
        $entry->delete();

        return response()->json(['message' => 'Schedule entry removed.']);
    }
}
