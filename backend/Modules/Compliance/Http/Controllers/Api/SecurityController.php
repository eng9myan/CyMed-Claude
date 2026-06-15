<?php

namespace Modules\Compliance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Compliance\Models\AccountLockout;
use Modules\Compliance\Models\SecurityEvent;

class SecurityController extends Controller
{
    public function securityEvents(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('security.events.view')) {
            abort(403);
        }

        $query = SecurityEvent::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('is_resolved')) {
            $query->where('is_resolved', (bool) $request->is_resolved);
        }

        $events = $query->orderByDesc('occurred_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'total' => $events->total(),
                'per_page' => $events->perPage(),
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
            ],
        ]);
    }

    public function logSecurityEvent(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('security.events.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'event_type' => ['required', 'string', 'max:50'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'event_details' => ['nullable', 'array'],
        ]);

        $event = SecurityEvent::create(array_merge($validated, [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'event_details' => $validated['event_details'] ?? [],
            'occurred_at' => now(),
        ]));

        return response()->json(['data' => $event, 'message' => 'Security event logged.'], 201);
    }

    public function resolveEvent(Request $request, string $id): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('security.events.manage')) {
            abort(403);
        }

        $event = SecurityEvent::findOrFail($id);
        $event->update([
            'is_resolved' => true,
            'resolved_by' => $authUser->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['data' => $event->fresh(), 'message' => 'Security event resolved.']);
    }

    public function accountLockouts(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('security.events.view')) {
            abort(403);
        }

        $lockouts = AccountLockout::whereNull('unlocked_at')
            ->orderByDesc('locked_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $lockouts->items(),
            'meta' => [
                'total' => $lockouts->total(),
                'per_page' => $lockouts->perPage(),
                'current_page' => $lockouts->currentPage(),
                'last_page' => $lockouts->lastPage(),
            ],
        ]);
    }

    public function unlockAccount(Request $request, string $lockoutId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('security.events.manage')) {
            abort(403);
        }

        $lockout = AccountLockout::findOrFail($lockoutId);
        $lockout->update([
            'unlocked_at' => now(),
            'unlocked_by' => $authUser->id,
        ]);

        return response()->json(['message' => 'Account unlocked.']);
    }
}
