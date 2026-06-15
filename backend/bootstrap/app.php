<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Security headers on all requests
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // PHI audit on API routes
        $middleware->appendToGroup('api', \App\Http\Middleware\PhiAccessAudit::class);

        // MFA enforcement on web routes
        $middleware->appendToGroup('web', \App\Http\Middleware\EnsureMfaVerified::class);

        // Spatie permission middleware aliases
        $middleware->alias([
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'mfa'                => \App\Http\Middleware\EnsureMfaVerified::class,
            'phi.audit'          => \App\Http\Middleware\PhiAccessAudit::class,
            'password.expiry'    => \App\Http\Middleware\EnforcePasswordExpiry::class,
        ]);

        // Throttle API routes
        $middleware->throttleApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->is('fhir/*'),
        );

        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You do not have the required permissions.',
                    'error' => 'PERMISSION_DENIED',
                ], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthenticated. Please log in.',
                    'error' => 'UNAUTHENTICATED',
                ], 401);
            }
        });
    })->create();
