<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserSession;
use App\Services\Audit\AuditService;
use App\Services\Auth\MfaService;
use App\Services\Auth\TokenService;
use App\Services\User\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected TokenService $tokenService,
        protected MfaService $mfaService,
        protected AuditService $auditService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = $this->userService->list($request->only([
            'facility_id', 'department_id', 'user_type', 'is_active', 'role', 'search', 'with_trashed',
        ]), $request->integer('per_page', 15));

        return response()->json(new UserCollection($users));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());
        $this->auditService->logSecurityEvent('user_created', ['created_user_id' => $user->id]);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'User created successfully.',
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json([
            'data' => new UserResource($user->load(['roles', 'facility', 'department'])),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $updated = $this->userService->update($user, $request->validated());
        $this->auditService->logSecurityEvent('user_updated', ['updated_user_id' => $user->id]);

        return response()->json([
            'data' => new UserResource($updated),
            'message' => 'User updated successfully.',
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->tokenService->revokeAllUserTokens($user, 'account_deleted');
        $user->delete();
        $this->auditService->logSecurityEvent('user_deleted', ['deleted_user_id' => $user->id]);

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function restore(string $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $this->authorize('restore', $user);

        $user->restore();
        $this->auditService->logSecurityEvent('user_restored', ['restored_user_id' => $user->id]);

        return response()->json(['data' => new UserResource($user), 'message' => 'User restored.']);
    }

    public function activate(User $user): JsonResponse
    {
        $this->authorize('update', $user);
        $this->userService->activate($user);
        $this->auditService->logSecurityEvent('user_activated', ['target_user_id' => $user->id]);

        return response()->json(['message' => 'User activated.']);
    }

    public function deactivate(User $user): JsonResponse
    {
        $this->authorize('update', $user);
        $this->userService->deactivate($user);
        $this->auditService->logSecurityEvent('user_deactivated', ['target_user_id' => $user->id]);

        return response()->json(['message' => 'User deactivated and sessions revoked.']);
    }

    public function forcePasswordReset(User $user): JsonResponse
    {
        $this->authorize('update', $user);
        $user->update(['must_change_password' => true]);
        $this->auditService->logSecurityEvent('forced_password_reset', ['target_user_id' => $user->id]);

        return response()->json(['message' => 'User will be required to change password on next login.']);
    }

    public function resetUserMfa(User $user): JsonResponse
    {
        $this->authorize('update', $user);
        $this->mfaService->disableMfa($user);
        $this->auditService->logSecurityEvent('admin_mfa_reset', ['target_user_id' => $user->id]);

        return response()->json(['message' => 'MFA has been disabled for this user.']);
    }

    public function sessions(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        $sessions = UserSession::where('user_id', $user->id)
            ->active()
            ->orderByDesc('last_active_at')
            ->get();

        return response()->json(['data' => $sessions]);
    }

    public function revokeSession(User $user, UserSession $session): JsonResponse
    {
        $this->authorize('update', $user);

        if ($session->user_id !== $user->id) {
            abort(404);
        }

        $this->tokenService->revokeToken($session->token_id, 'admin_revoked');

        return response()->json(['message' => 'Session revoked.']);
    }
}
