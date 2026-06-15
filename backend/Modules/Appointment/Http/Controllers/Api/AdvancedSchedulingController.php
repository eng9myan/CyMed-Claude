<?php

namespace Modules\Appointment\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Appointment\Models\AppointmentReminder;
use Modules\Appointment\Models\AppointmentWaitlist;
use Modules\Appointment\Models\ScheduleTemplate;

class AdvancedSchedulingController extends Controller
{
    public function templates(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('scheduling.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $templates = ScheduleTemplate::where('facility_id', $validated['facility_id'])
            ->where('is_active', true)
            ->orderBy('template_name')
            ->get();

        return response()->json(['data' => $templates]);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('scheduling.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'provider_id' => ['required', 'uuid', 'exists:users,id'],
            'template_name' => ['required', 'string', 'max:100'],
            'specialty' => ['nullable', 'string', 'max:50'],
            'slot_duration_minutes' => ['required', 'integer', 'min:5', 'max:120'],
            'weekly_pattern' => ['required', 'array'],
            'max_patients_per_slot' => ['sometimes', 'integer', 'min:1'],
        ]);

        $template = ScheduleTemplate::create($validated);

        return response()->json([
            'data' => $template,
            'message' => 'Schedule template created.',
        ], 201);
    }

    public function waitlist(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('scheduling.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $waitlist = AppointmentWaitlist::where('facility_id', $validated['facility_id'])
            ->where('status', 'waiting')
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'soon' THEN 2 ELSE 3 END")
            ->orderBy('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $waitlist->items(),
            'meta' => [
                'total' => $waitlist->total(),
                'per_page' => $waitlist->perPage(),
                'current_page' => $waitlist->currentPage(),
                'last_page' => $waitlist->lastPage(),
            ],
        ]);
    }

    public function addToWaitlist(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('scheduling.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'provider_id' => ['nullable', 'uuid', 'exists:users,id'],
            'specialty' => ['nullable', 'string', 'max:50'],
            'appointment_type' => ['sometimes', 'string', 'max:30'],
            'priority' => ['required', 'in:urgent,soon,routine'],
            'earliest_date' => ['nullable', 'date'],
            'latest_date' => ['nullable', 'date'],
        ]);

        $entry = AppointmentWaitlist::create($validated);

        return response()->json([
            'data' => $entry,
            'message' => 'Patient added to waitlist.',
        ], 201);
    }

    public function scheduleFromWaitlist(Request $request, string $waitlistId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('scheduling.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'appointment_id' => ['required', 'uuid', 'exists:appointments,id'],
        ]);

        $entry = AppointmentWaitlist::findOrFail($waitlistId);
        $entry->update([
            'status' => 'scheduled',
            'booked_appointment_id' => $validated['appointment_id'],
        ]);

        return response()->json([
            'data' => $entry->fresh(),
            'message' => 'Waitlist entry converted to appointment.',
        ]);
    }
}
