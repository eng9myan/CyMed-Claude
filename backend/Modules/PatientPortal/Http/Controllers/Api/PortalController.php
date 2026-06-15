<?php

namespace Modules\PatientPortal\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Appointment\Models\Appointment;
use Modules\Patient\Models\Patient;

class PortalController extends Controller
{
    private function resolvePatient(): ?Patient
    {
        $user = Auth::user();
        if (! $user->patient_id) {
            return null;
        }
        return Patient::find($user->patient_id);
    }

    public function myAppointments(Request $request): JsonResponse
    {
        $patient = $this->resolvePatient();
        if (! $patient) {
            return response()->json(['message' => 'No linked patient record.'], 403);
        }

        $appointments = Appointment::where('patient_id', $patient->id)
            ->with(['physician:id,first_name,last_name,specialty', 'facility:id,name', 'department:id,name'])
            ->orderByDesc('appointment_date')
            ->paginate((int) ($request->per_page ?? 10));

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

    public function bookAppointment(Request $request): JsonResponse
    {
        $patient = $this->resolvePatient();
        if (! $patient) {
            return response()->json(['message' => 'No linked patient record.'], 403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'department_id' => ['required', 'uuid', 'exists:departments,id'],
            'physician_id' => ['required', 'uuid', 'exists:users,id'],
            'appointment_type' => ['required', 'in:new_visit,follow_up,telemedicine'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'visit_reason' => ['nullable', 'string', 'max:500'],
        ]);

        // Conflict check
        $conflict = Appointment::where('physician_id', $validated['physician_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('start_time', $validated['start_time'])
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'This time slot is no longer available.'], 422);
        }

        $user = Auth::user();
        $validated['patient_id'] = $patient->id;
        $validated['appointment_number'] = Appointment::generateAppointmentNumber();
        $validated['status'] = 'scheduled';
        $validated['booking_source'] = 'patient_portal';
        $validated['booked_by_type'] = 'patient';
        $validated['booked_by_id'] = $user->id;
        $validated['duration_minutes'] = 15;

        $appointment = Appointment::create($validated);

        return response()->json([
            'data' => $appointment->load(['physician:id,first_name,last_name', 'facility:id,name']),
            'message' => 'Appointment booked.',
        ], 201);
    }

    public function cancelAppointment(Request $request, Appointment $appointment): JsonResponse
    {
        $patient = $this->resolvePatient();
        if (! $patient || $appointment->patient_id !== $patient->id) {
            abort(403);
        }

        if (! in_array($appointment->status, ['scheduled', 'confirmed'])) {
            return response()->json(['message' => 'This appointment cannot be cancelled.'], 422);
        }

        $appointment->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->input('reason', 'Cancelled by patient'),
            'cancellation_by' => 'patient',
        ]);

        return response()->json(['message' => 'Appointment cancelled.']);
    }

    public function myProfile(): JsonResponse
    {
        $patient = $this->resolvePatient();
        if (! $patient) {
            return response()->json(['message' => 'No linked patient record.'], 403);
        }

        return response()->json(['data' => $patient->load(['primaryInsurance'])]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $patient = $this->resolvePatient();
        if (! $patient) {
            return response()->json(['message' => 'No linked patient record.'], 403);
        }

        $validated = $request->validate([
            'phone_primary' => ['nullable', 'string', 'max:20'],
            'phone_secondary' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:200'],
            'addresses' => ['nullable', 'array'],
            'emergency_contacts' => ['nullable', 'array'],
        ]);

        $patient->update($validated);

        return response()->json([
            'data' => $patient->fresh(),
            'message' => 'Profile updated.',
        ]);
    }
}
