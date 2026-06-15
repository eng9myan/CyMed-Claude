<?php

namespace Modules\Telemedicine\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Telemedicine\Models\TeleconsultSession;
use Modules\Telemedicine\Models\TelemedicinePrescription;
use Modules\Telemedicine\Models\VideoCallLog;
use Modules\Telemedicine\Models\VirtualWaitingRoom;

class TelemedicineAdvancedController extends Controller
{
    public function logCallEvent(Request $request, string $sessionId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.manage')) {
            abort(403);
        }

        TeleconsultSession::findOrFail($sessionId);

        $validated = $request->validate([
            'event_type' => ['required', 'in:joined,left,muted,unmuted,screen_share_start,screen_share_stop'],
            'platform' => ['nullable', 'in:web,ios,android'],
            'connection_quality' => ['nullable', 'in:good,fair,poor'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $log = VideoCallLog::create(array_merge($validated, [
            'session_id' => $sessionId,
            'user_id' => $authUser->id,
            'occurred_at' => now(),
        ]));

        return response()->json(['data' => $log, 'message' => 'Call event logged.'], 201);
    }

    public function joinWaitingRoom(Request $request, string $sessionId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.view')) {
            abort(403);
        }

        $session = TeleconsultSession::findOrFail($sessionId);

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $entry = VirtualWaitingRoom::create([
            'session_id' => $sessionId,
            'patient_id' => $validated['patient_id'],
            'joined_waiting_at' => now(),
            'status' => 'waiting',
        ]);

        return response()->json(['data' => $entry, 'message' => 'Patient added to waiting room.'], 201);
    }

    public function admitFromWaiting(Request $request, string $waitingId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.manage')) {
            abort(403);
        }

        $waiting = VirtualWaitingRoom::findOrFail($waitingId);

        $waitSeconds = now()->diffInSeconds($waiting->joined_waiting_at);
        $waiting->update([
            'status' => 'admitted',
            'admitted_at' => now(),
            'wait_time_seconds' => $waitSeconds,
        ]);

        return response()->json(['data' => $waiting->fresh(), 'message' => 'Patient admitted.']);
    }

    public function issuePrescription(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.prescribe')) {
            abort(403);
        }

        $validated = $request->validate([
            'session_id' => ['required', 'uuid', 'exists:teleconsult_sessions,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'drug_name' => ['required', 'string', 'max:255'],
            'dosage' => ['required', 'string', 'max:100'],
            'frequency' => ['required', 'string', 'max:50'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'instructions' => ['nullable', 'string'],
            'is_controlled' => ['sometimes', 'boolean'],
        ]);

        $prescription = TelemedicinePrescription::create(array_merge($validated, [
            'prescriber_id' => $authUser->id,
            'issued_at' => now(),
        ]));

        return response()->json([
            'data' => $prescription,
            'message' => 'Telemedicine prescription issued.',
        ], 201);
    }

    public function sessionPrescriptions(Request $request, string $sessionId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.view')) {
            abort(403);
        }

        $prescriptions = TelemedicinePrescription::where('session_id', $sessionId)
            ->orderByDesc('issued_at')
            ->get();

        return response()->json(['data' => $prescriptions]);
    }
}
