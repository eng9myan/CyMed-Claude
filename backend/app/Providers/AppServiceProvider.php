<?php

namespace App\Providers;

use App\Models\HospitalGroup;
use App\Models\User;
use App\Policies\RolePolicy;
use App\Policies\UserPolicy;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            \App\Services\Auth\MfaService::class,
            fn ($app) => new \App\Services\Auth\MfaService(new \PragmaRX\Google2FA\Google2FA())
        );
    }

    public function boot(): void
    {
        $this->configurePolicies();
        $this->configureRateLimiting();
        $this->configureApiDocs();

        // Strict mode in non-production
        Model::shouldBeStrict(! app()->isProduction());

        // Password reset URL points to frontend
        ResetPassword::createUrlUsing(function ($notifiable, $token) {
            $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');

            return $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });

        // Password policy (NIST SP 800-63B compliant)
        Password::defaults(function () {
            return Password::min(12)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised();
        });

        // Prevent N+1 in development
        if (! app()->isProduction()) {
            DB::listen(function ($query) {
                if ($query->time > 2000) {
                    Log::warning('Slow query detected', [
                        'sql' => $query->sql,
                        'time' => $query->time,
                    ]);
                }
            });
        }
    }

    protected function configurePolicies(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(\Modules\Patient\Models\Patient::class, \Modules\Patient\Policies\PatientPolicy::class);
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }

    protected function configureApiDocs(): void
    {
        Scramble::afterOpenApiGenerated(function (OpenApi $openApi) {
            $openApi->secure(SecurityScheme::http('bearer'));

            // Tag all routes by their first path segment for grouping in the UI
            foreach ($openApi->paths->paths as $path) {
                foreach ($path->operations() as $operation) {
                    if (empty($operation->tags)) {
                        $segment = explode('/', ltrim($path->path, '/'))[0] ?? 'General';
                        $operation->tags = [ucfirst(str_replace(['-', '_'], ' ', $segment))];
                    }
                }
            }
        });
    }
}
