<?php

namespace Modules\Notifications\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notifications\Models\NotificationLog;
use Modules\Notifications\Models\NotificationTemplate;

class NotificationsController extends Controller
{
    public function templates(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('notifications.manage')) {
            abort(403);
        }

        $query = NotificationTemplate::query();

        if ($request->has('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        $templates = $query->orderBy('template_code')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $templates->items(),
            'meta' => [
                'total' => $templates->total(),
                'per_page' => $templates->perPage(),
                'current_page' => $templates->currentPage(),
                'last_page' => $templates->lastPage(),
            ],
        ]);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('notifications.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'template_code' => ['required', 'string', 'max:50', 'unique:notification_templates,template_code'],
            'name' => ['required', 'string', 'max:200'],
            'channel' => ['required', 'in:push,sms,email,in_app'],
            'subject' => ['nullable', 'string', 'max:300'],
            'body_template' => ['required', 'string'],
            'language' => ['nullable', 'string', 'max:5'],
        ]);

        $template = NotificationTemplate::create($validated);

        return response()->json([
            'data' => $template,
            'message' => 'Notification template created.',
        ], 201);
    }

    public function updateTemplate(Request $request, string $id): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('notifications.manage')) {
            abort(403);
        }

        $template = NotificationTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:200'],
            'subject' => ['nullable', 'string', 'max:300'],
            'body_template' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $template->update($validated);

        return response()->json([
            'data' => $template->fresh(),
            'message' => 'Template updated.',
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('notifications.send')) {
            abort(403);
        }

        $validated = $request->validate([
            'channel' => ['required', 'in:push,sms,email,in_app'],
            'recipient' => ['required', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:300'],
            'body' => ['required', 'string'],
            'template_code' => ['nullable', 'string', 'max:50'],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'patient_id' => ['nullable', 'uuid'],
        ]);

        $log = NotificationLog::create(array_merge($validated, [
            'status' => 'sent',
            'sent_at' => now(),
        ]));

        return response()->json([
            'data' => $log,
            'message' => 'Notification sent.',
        ], 201);
    }

    public function logs(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('notifications.manage')) {
            abort(403);
        }

        $query = NotificationLog::query();

        if ($request->has('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->orderByDesc('sent_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }
}
