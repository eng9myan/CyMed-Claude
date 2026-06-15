<?php

namespace Modules\Telemedicine\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Telemedicine\Models\TeleconsultMessage;
use Modules\Telemedicine\Models\TeleconsultSession;

class TeleconsultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.view')) {
            abort(403);
        }

        $sessions = TeleconsultSession::with(['patient:id,first_name,last_name,mrn', 'provider:id,first_name,last_name,email'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->provider_id, fn ($q, $v) => $q->where('provider_id', $v))
            ->when($request->date, fn ($q, $v) => $q->whereDate('scheduled_at', $v))
            ->orderByDesc('scheduled_at')
            ->paginate(20);

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'total' => $sessions->total(),
                'per_page' => $sessions->perPage(),
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'provider_id' => ['required', 'uuid', 'exists:users,id'],
            'appointment_id' => ['nullable', 'uuid', 'exists:appointments,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'session_type' => ['required', 'in:video,audio,chat'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'chief_complaint' => ['nullable', 'string'],
            'platform_session_id' => ['nullable', 'string', 'max:100'],
        ]);

        $validated['session_number'] = TeleconsultSession::generateSessionNumber();
        $validated['status'] = 'scheduled';

        $session = TeleconsultSession::create($validated);

        return response()->json([
            'data' => $session->load(['patient:id,first_name,last_name,mrn', 'provider:id,first_name,last_name,email']),
            'message' => 'Session scheduled.',
        ], 201);
    }

    public function show(Request $request, TeleconsultSession $session): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.view')) {
            abort(403);
        }

        return response()->json([
            'data' => $session->load(['patient', 'provider', 'messages']),
        ]);
    }

    public function start(Request $request, TeleconsultSession $session): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.manage')) {
            abort(403);
        }

        if (! in_array($session->status, ['scheduled', 'waiting'])) {
            return response()->json(['message' => 'Session cannot be started from its current status.'], 422);
        }

        $session->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json([
            'data' => $session->fresh(),
            'message' => 'Session started.',
        ]);
    }

    public function complete(Request $request, TeleconsultSession $session): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.manage')) {
            abort(403);
        }

        if ($session->status !== 'in_progress') {
            return response()->json(['message' => 'Only in-progress sessions can be completed.'], 422);
        }

        $validated = $request->validate([
            'session_notes' => ['nullable', 'string'],
            'prescription_issued' => ['nullable', 'boolean'],
            'follow_up_required' => ['nullable', 'boolean'],
            'follow_up_notes' => ['nullable', 'string'],
        ]);

        $endedAt = now();
        $durationMinutes = $session->started_at
            ? (int) round($session->started_at->diffInMinutes($endedAt))
            : null;

        $session->update(array_merge($validated, [
            'status' => 'completed',
            'ended_at' => $endedAt,
            'duration_minutes' => $durationMinutes,
        ]));

        return response()->json([
            'data' => $session->fresh(),
            'message' => 'Session completed.',
        ]);
    }

    public function cancel(Request $request, TeleconsultSession $session): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.manage')) {
            abort(403);
        }

        if (in_array($session->status, ['completed', 'cancelled'])) {
            return response()->json(['message' => 'Session cannot be cancelled from its current status.'], 422);
        }

        $validated = $request->validate([
            'cancellation_reason' => ['nullable', 'string'],
        ]);

        $session->update([
            'status' => 'cancelled',
            'cancelled_by' => $authUser->id,
            'cancellation_reason' => $validated['cancellation_reason'] ?? null,
        ]);

        return response()->json([
            'data' => $session->fresh(),
            'message' => 'Session cancelled.',
        ]);
    }

    public function sendMessage(Request $request, TeleconsultSession $session): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('telemedicine.view')) {
            abort(403);
        }

        if ($session->status !== 'in_progress') {
            return response()->json(['message' => 'Messages can only be sent during an in-progress session.'], 422);
        }

        $validated = $request->validate([
            'message_type' => ['required', 'in:text,file,image'],
            'content' => ['required', 'string'],
            'attachment_url' => ['nullable', 'string', 'max:255'],
            'sender_type' => ['required', 'in:patient,provider'],
        ]);

        $message = TeleconsultMessage::create([
            'session_id' => $session->id,
            'sender_id' => $authUser->id,
            'sender_type' => $validated['sender_type'],
            'message_type' => $validated['message_type'],
            'content' => $validated['content'],
            'attachment_url' => $validated['attachment_url'] ?? null,
        ]);

        return response()->json([
            'data' => $message->load('sender:id,first_name,last_name,email'),
            'message' => 'Message sent.',
        ], 201);
    }
}
