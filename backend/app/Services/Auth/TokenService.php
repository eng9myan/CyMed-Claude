<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Laravel\Passport\Token;

class TokenService
{
    public function issueToken(User $user, Request $request, array $scopes = ['*']): array
    {
        $tokenResult = $user->createToken('CyMed API', $scopes);
        $token = $tokenResult->token;

        $expiresAt = now()->addHours(8);
        $token->expires_at = $expiresAt;
        $token->save();

        $this->recordSession($user, $token->id, $request, $expiresAt);

        return [
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    public function revokeToken(string $tokenId, string $reason = 'logout'): void
    {
        Token::find($tokenId)?->revoke();

        UserSession::where('token_id', $tokenId)->update([
            'is_revoked' => true,
            'revoked_reason' => $reason,
        ]);
    }

    public function revokeAllUserTokens(User $user, string $reason = 'security'): void
    {
        $user->tokens()->update(['revoked' => true]);

        UserSession::where('user_id', $user->id)
            ->where('is_revoked', false)
            ->update([
                'is_revoked' => true,
                'revoked_reason' => $reason,
            ]);
    }

    public function recordSession(User $user, string $tokenId, Request $request, $expiresAt): UserSession
    {
        return UserSession::create([
            'user_id' => $user->id,
            'token_id' => $tokenId,
            'device_name' => $request->input('device_name', $request->header('X-Device-Name')),
            'device_type' => $this->detectDeviceType($request),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_active_at' => now(),
            'expires_at' => $expiresAt,
        ]);
    }

    private function detectDeviceType(Request $request): string
    {
        $deviceType = $request->input('device_type', $request->header('X-Device-Type', ''));

        return match (strtolower($deviceType)) {
            'ios', 'mobile_ios' => 'mobile_ios',
            'android', 'mobile_android' => 'mobile_android',
            'desktop', 'desktop_app' => 'desktop_app',
            'api' => 'api',
            default => 'web',
        };
    }
}
