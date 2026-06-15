<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

    public function boot(): void
    {
        Passport::tokensExpireIn(now()->addHours(8));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));

        Passport::tokensCan([
            'patient:read'        => 'Read patient demographics and basic information',
            'patient:write'       => 'Create and update patient records',
            'clinical:read'       => 'Read clinical records (notes, vitals, results)',
            'clinical:write'      => 'Create and update clinical records',
            'prescribe'           => 'Write prescriptions and medication orders',
            'lab:order'           => 'Order laboratory tests',
            'lab:result'          => 'View and verify laboratory results',
            'imaging:order'       => 'Order imaging studies',
            'imaging:result'      => 'View imaging reports',
            'billing:read'        => 'View billing and financial information',
            'billing:write'       => 'Create and manage billing records',
            'insurance:manage'    => 'Manage insurance claims and authorizations',
            'admin:read'          => 'Read administrative data',
            'admin:write'         => 'Manage administrative settings',
            'fhir:read'           => 'Read FHIR resources',
            'fhir:write'          => 'Write FHIR resources',
        ]);

        // Super admin gate - bypasses all permission checks except protected operations
        Gate::before(function ($user, $ability, $arguments) {
            if ($user->hasRole('super-admin')) {
                // Let policies handle deletion of Spatie roles (to protect system roles)
                if ($ability === 'delete' && isset($arguments[0]) && $arguments[0] instanceof \Spatie\Permission\Models\Role) {
                    return null;
                }

                return true;
            }
        });

        // Emergency break-glass access
        Gate::after(function ($user, $ability, $result, $arguments) {
            if (! $result && $user->hasRole('break-glass')) {
                // Log the break-glass access
                activity('break_glass')
                    ->causedBy($user)
                    ->withProperties([
                        'ability' => $ability,
                        'arguments' => $arguments,
                        'ip' => request()->ip(),
                    ])
                    ->log("Break-glass access used for: {$ability}");
                return true;
            }
        });
    }
}
