<?php

namespace App\Http\Middleware;

use App\Services\Auth\PasswordService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforcePasswordExpiry
{
    public function __construct(protected PasswordService $passwordService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if ($user->must_change_password || $this->passwordService->isExpired($user)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your password has expired. Please change it to continue.',
                    'error_code' => 'PASSWORD_EXPIRED',
                ], 403);
            }
        }

        return $next($request);
    }
}
