<?php

namespace Modules\PatientEngagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\PatientEngagement\Models\HealthEducationContent;
use Modules\PatientEngagement\Models\PatientFeedback;
use Modules\PatientEngagement\Models\PatientNotification;

class PatientEngagementController extends Controller
{
    public function submitFeedback(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'feedback_type' => ['required', 'in:general,appointment,staff,facility,billing,clinical'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comments' => ['nullable', 'string'],
            'is_anonymous' => ['nullable', 'boolean'],
        ]);

        $feedback = PatientFeedback::create($validated);

        return response()->json([
            'data' => $feedback,
            'message' => 'Feedback submitted successfully.',
        ], 201);
    }

    public function myFeedback(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $patientId = $authUser->patient_id;

        if (! $patientId) {
            return response()->json(['data' => [], 'meta' => ['total' => 0]]);
        }

        $feedback = PatientFeedback::where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $feedback->items(),
            'meta' => [
                'total' => $feedback->total(),
                'per_page' => $feedback->perPage(),
                'current_page' => $feedback->currentPage(),
                'last_page' => $feedback->lastPage(),
            ],
        ]);
    }

    public function educationContent(Request $request): JsonResponse
    {
        $query = HealthEducationContent::where('is_published', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('content_type')) {
            $query->where('content_type', $request->content_type);
        }

        $content = $query->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $content->items(),
            'meta' => [
                'total' => $content->total(),
                'per_page' => $content->perPage(),
                'current_page' => $content->currentPage(),
                'last_page' => $content->lastPage(),
            ],
        ]);
    }

    public function myNotifications(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $patientId = $authUser->patient_id;

        if (! $patientId) {
            return response()->json(['data' => [], 'meta' => ['total' => 0]]);
        }

        $notifications = PatientNotification::where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    public function markRead(Request $request, PatientNotification $notification): JsonResponse
    {
        $authUser = $request->user();

        $patientId = $authUser->patient_id;

        if ($notification->patient_id !== $patientId) {
            abort(403, 'This notification does not belong to you.');
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'data' => $notification->fresh(),
            'message' => 'Notification marked as read.',
        ]);
    }

    public function createNotification(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('notifications.send')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'notification_type' => ['required', 'in:appointment_reminder,result_ready,prescription_ready,bill_due,general,follow_up'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        $notification = PatientNotification::create($validated);

        return response()->json([
            'data' => $notification,
            'message' => 'Notification sent.',
        ], 201);
    }
}
