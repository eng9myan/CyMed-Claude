<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserSession;
use App\Services\Audit\AuditService;
use App\Services\Auth\PasswordService;
use App\Services\Auth\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        protected PasswordService $passwordService,
        protected TokenService $tokenService,
        protected AuditService $auditService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = User::with(['roles.permissions', 'permissions', 'facility', 'department'])
            ->findOrFail($request->user()->id);

        return response()->json(['data' => new UserResource($user)]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['nullable', 'string', 'max:80'],
            'last_name' => ['nullable', 'string', 'max:80'],
            'first_name_ar' => ['nullable', 'string', 'max:80'],
            'last_name_ar' => ['nullable', 'string', 'max:80'],
            'mobile' => ['nullable', 'string', 'max:30'],
            'display_name' => ['nullable', 'string', 'max:200'],
        ]);

        $user = User::with(['roles.permissions', 'permissions', 'facility', 'department'])
            ->findOrFail($request->user()->id);

        $user->update($request->only([
            'first_name', 'last_name', 'first_name_ar', 'last_name_ar', 'mobile', 'display_name',
        ]));

        return response()->json(['data' => new UserResource($user->fresh(['roles.permissions', 'permissions', 'facility', 'department'])), 'message' => 'Profile updated.']);
    }

    public function preferences(Request $request): JsonResponse
    {
        $request->validate([
            'locale' => ['nullable', 'string', 'in:en,ar,fr,ur,hi'],
            'is_rtl' => ['nullable', 'boolean'],
            'timezone' => ['nullable', 'string', 'timezone'],
            'preferences' => ['nullable', 'array'],
            'notification_settings' => ['nullable', 'array'],
        ]);

        $user = User::with(['roles.permissions', 'permissions', 'facility', 'department'])
            ->findOrFail($request->user()->id);

        $user->update($request->only([
            'locale', 'is_rtl', 'timezone', 'preferences', 'notification_settings',
        ]));

        return response()->json(['data' => new UserResource($user->fresh(['roles.permissions', 'permissions', 'facility', 'department'])), 'message' => 'Preferences updated.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->passwordService->changePassword(
            $request->user(),
            $request->current_password,
            $request->password,
        );

        $this->auditService->logSecurityEvent('password_changed', ['user_id' => $request->user()->id]);

        return response()->json(['message' => __('auth.password_changed')]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->token()->id;

        $sessions = UserSession::where('user_id', $request->user()->id)
            ->active()
            ->orderByDesc('last_active_at')
            ->get()
            ->map(fn ($s) => array_merge($s->toArray(), ['is_current' => $s->token_id === $currentTokenId]));

        return response()->json(['data' => $sessions]);
    }

    public function revokeSession(Request $request, UserSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($session->token_id === $request->user()->token()->id) {
            return response()->json(['message' => 'Cannot revoke current session. Use logout.'], 422);
        }

        $this->tokenService->revokeToken($session->token_id, 'user_revoked');

        return response()->json(['message' => 'Session revoked.']);
    }
}
