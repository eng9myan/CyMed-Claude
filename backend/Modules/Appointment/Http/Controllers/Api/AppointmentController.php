<?php

namespace Modules\Appointment\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Appointment\Models\Appointment;
use Modules\Appointment\Models\AppointmentSchedule;
use Modules\Appointment\Services\SlotGeneratorService;

class AppointmentController extends Controller
{
    public function __construct(protected SlotGeneratorService $slotGenerator) {}

    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.view', 'patient.view'])) {
            abort(403);
        }

        $appointments = Appointment::with(['patient:id,first_name,last_name,mrn', 'physician:id,first_name,last_name,specialty', 'department:id,name', 'facility:id,name'])
            ->when($request->physician_id, fn ($q, $v) => $q->where('physician_id', $v))
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->date, fn ($q, $v) => $q->where('appointment_date', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->orderByDesc('appointment_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $appointments->items(),
            'meta' => [
                'total' => $appointments->total(),
                'per_page' => $appointments->perPage(),
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.create', 'patients.update', 'patient.view'])) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'department_id' => ['required', 'uuid', 'exists:departments,id'],
            'physician_id' => ['required', 'uuid', 'exists:users,id'],
            'schedule_id' => ['nullable', 'uuid', 'exists:appointment_schedules,id'],
            'appointment_type' => ['required', 'in:new_visit,follow_up,procedure,emergency,telemedicine'],
            'appointment_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'duration_minutes' => ['nullable', 'integer', 'min:5', 'max:480'],
            'visit_reason' => ['nullable', 'string', 'max:500'],
            'is_new_patient' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Conflict check
        $conflict = Appointment::where('physician_id', $validated['physician_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('start_time', $validated['start_time'])
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'This time slot is already booked.'], 422);
        }

        $validated['appointment_number'] = Appointment::generateAppointmentNumber();
        $validated['status'] = 'scheduled';
        $validated['booking_source'] = 'staff';
        $validated['booked_by_type'] = 'user';
        $validated['booked_by_id'] = $authUser->id;
        $validated['duration_minutes'] ??= 15;

        $appointment = Appointment::create($validated);

        return response()->json([
            'data' => $appointment->load(['patient:id,first_name,last_name,mrn', 'physician:id,first_name,last_name']),
            'message' => 'Appointment scheduled.',
        ], 201);
    }

    public function show(Request $request, Appointment $appointment): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.view', 'patient.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $appointment->load(['patient', 'physician', 'department', 'facility', 'schedule']),
        ]);
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.create', 'patients.update'])) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:scheduled,confirmed,arrived,in_progress,completed,cancelled,no_show,rescheduled'],
            'appointment_date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'visit_reason' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'cancellation_reason' => ['required_if:status,cancelled', 'nullable', 'string'],
        ]);

        if (($validated['status'] ?? null) === 'arrived') {
            $validated['arrived_at'] = now();
        }
        if (($validated['status'] ?? null) === 'cancelled') {
            $validated['cancelled_at'] = now();
            $validated['cancellation_by'] = 'staff';
        }

        $appointment->update($validated);

        return response()->json([
            'data' => $appointment->fresh(),
            'message' => 'Appointment updated.',
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $this->authorize('delete', \Modules\Patient\Models\Patient::class);
        $appointment->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_by' => 'staff',
        ]);
        $appointment->delete();

        return response()->json(['message' => 'Appointment cancelled.']);
    }

    public function schedules(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.view', 'patient.view'])) {
            abort(403);
        }

        $schedules = AppointmentSchedule::with(['physician:id,first_name,last_name,specialty', 'department:id,name', 'facility:id,name'])
            ->when($request->physician_id, fn ($q, $v) => $q->where('physician_id', $v))
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->when($request->department_id, fn ($q, $v) => $q->where('department_id', $v))
            ->where('is_active', true)
            ->get();

        return response()->json(['data' => $schedules]);
    }

    public function availability(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.view', 'patient.view'])) {
            abort(403);
        }

        $validated = $request->validate([
            'physician_id' => ['required', 'uuid', 'exists:users,id'],
            'date' => ['required', 'date'],
        ]);

        $slots = $this->slotGenerator->getAvailableSlots($validated['physician_id'], $validated['date']);

        return response()->json([
            'data' => $slots,
            'meta' => [
                'physician_id' => $validated['physician_id'],
                'date' => $validated['date'],
                'available_count' => count($slots),
            ],
        ]);
    }
}
