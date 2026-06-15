<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\MfaConfirmRequest;
use App\Http\Requests\Auth\MfaVerifyRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Auth\MfaService;
use App\Services\Auth\PasswordService;
use App\Services\Auth\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
        protected MfaService $mfaService,
        protected TokenService $tokenService,
        protected PasswordService $passwordService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('username', $request->username)
            ->orWhere('email', $request->username)
            ->first();

        if ($user && $user->is_locked && $user->locked_until?->isFuture()) {
            return response()->json([
                'message' => __('auth.account_locked'),
                'error_code' => 'ACCOUNT_LOCKED',
                'locked_until' => $user->locked_until->toIso8601String(),
            ], 423);
        }

        if (! $user || ! Hash::check($request->password, $user->password)) {
            if ($user) {
                $user->incrementFailedLogin();
            }
            $this->auditService->logSecurityEvent('failed_login', [
                'username' => $request->username,
                'ip' => $request->ip(),
            ]);
            throw ValidationException::withMessages([
                'username' => [__('auth.login_failed')],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => __('auth.account_inactive'), 'error_code' => 'ACCOUNT_INACTIVE'], 403);
        }

        $user->resetFailedLogin();
        $this->auditService->logSecurityEvent('successful_login', ['user_id' => $user->id]);

        if ($user->mfa_enabled) {
            return response()->json([
                'mfa_required' => true,
                'user_id' => $user->id,
                'message' => __('auth.mfa_required'),
            ]);
        }

        $tokenData = $this->tokenService->issueToken($user, $request);

        return response()->json([
            'data' => new UserResource($user->load(['roles', 'facility', 'department'])),
            'token' => $tokenData,
            'message' => __('auth.login_success'),
        ]);
    }

    public function verifyMfa(MfaVerifyRequest $request): JsonResponse
    {
        $userId = $request->input('user_id');

        $user = User::find($userId);

        if (! $user || ! $user->mfa_enabled) {
            return response()->json(['message' => __('auth.mfa_invalid'), 'error_code' => 'MFA_INVALID'], 422);
        }

        $code = $request->input('code');
        $isBackupCode = strlen(str_replace('-', '', $code)) === 8;

        $verified = $isBackupCode
            ? $this->mfaService->verifyBackupCode($user, $code)
            : $this->mfaService->verifyCode($user->mfa_secret, $code);

        if (! $verified) {
            $this->auditService->logSecurityEvent('mfa_failed', ['user_id' => $user->id]);
            return response()->json(['message' => __('auth.mfa_invalid'), 'error_code' => 'MFA_CODE_INVALID'], 422);
        }

        $this->auditService->logSecurityEvent('mfa_verified', ['user_id' => $user->id]);

        $tokenData = $this->tokenService->issueToken($user, $request);

        return response()->json([
            'data' => new UserResource($user->load(['roles', 'facility', 'department'])),
            'token' => $tokenData,
            'message' => __('auth.mfa_verified'),
        ]);
    }

    public function setupMfa(Request $request): JsonResponse
    {
        $user = $request->user();
        $secret = $this->mfaService->generateSecret();
        $qrCode = $this->mfaService->generateQrCodeSvg($user, $secret);

        return response()->json([
            'data' => [
                'secret' => $secret,
                'qr_code' => $qrCode,
                'qr_code_url' => $this->mfaService->getQrCodeUrl($user, $secret),
            ],
            'message' => 'Scan QR code with your authenticator app, then confirm with a code.',
        ]);
    }

    public function confirmMfa(MfaConfirmRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $this->mfaService->verifyCode($request->secret, $request->code)) {
            return response()->json(['message' => __('auth.mfa_invalid'), 'error_code' => 'MFA_CODE_INVALID'], 422);
        }

        $this->mfaService->enableMfa($user, $request->secret);
        $backupCodes = $this->mfaService->generateBackupCodes($user);

        $this->auditService->logSecurityEvent('mfa_enabled', ['user_id' => $user->id]);

        return response()->json([
            'data' => ['backup_codes' => $backupCodes],
            'message' => __('auth.mfa_enabled'),
        ]);
    }

    public function disableMfa(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
            'code' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['password' => [__('auth.current_password_incorrect')]]);
        }

        if (! $this->mfaService->verifyCode($user->mfa_secret, $request->code)) {
            throw ValidationException::withMessages(['code' => [__('auth.mfa_invalid')]]);
        }

        $this->mfaService->disableMfa($user);
        $this->auditService->logSecurityEvent('mfa_disabled', ['user_id' => $user->id]);

        return response()->json(['message' => __('auth.mfa_disabled')]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->token();
        $tokenId = $token?->id;

        if ($tokenId) {
            $this->tokenService->revokeToken($tokenId, 'logout');
        }

        $this->auditService->logSecurityEvent('logout', ['user_id' => $request->user()->id]);

        return response()->json(['message' => __('auth.logout_success')]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $oldTokenId = $user->token()?->id;

        if ($oldTokenId) {
            $this->tokenService->revokeToken($oldTokenId, 'token_refresh');
        }

        $tokenData = $this->tokenService->issueToken($user, $request);

        return response()->json(['data' => ['token' => $tokenData], 'message' => 'Token refreshed.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = User::with(['roles', 'facility', 'department'])->findOrFail($request->user()->id);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordService->sendResetLink($request->email);

        $this->auditService->logSecurityEvent('password_reset_requested', ['email' => $request->email]);

        // Always return success to prevent email enumeration
        return response()->json(['message' => __('auth.password_reset_sent')]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $success = $this->passwordService->resetPassword($request->validated());

        if (! $success) {
            return response()->json(['message' => __('auth.password_reset_failed'), 'error_code' => 'RESET_FAILED'], 422);
        }

        $this->auditService->logSecurityEvent('password_reset_completed', ['email' => $request->email]);

        return response()->json(['message' => __('auth.password_changed')]);
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
}
