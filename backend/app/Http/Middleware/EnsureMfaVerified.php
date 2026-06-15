<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMfaVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $response = $next($request);
        }

        if ($user->mfa_enabled && ! $request->session()->get('mfa_verified')) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'MFA verification required.',
                    'mfa_required' => true,
                ], 403);
            }
            return redirect()->route('mfa.challenge');
        }

        return $next($request);
    }
}
