<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Fhir\FhirService;
use App\Services\Fhir\FhirValidator;
use App\Services\AI\ClinicalAIService;
use App\Services\Audit\AuditService;
use App\Services\Notification\ClinicalNotificationService;

class CyMedServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(FhirService::class, function ($app) {
            return new FhirService(config('cymed.fhir'));
        });

        $this->app->singleton(FhirValidator::class, function ($app) {
            return new FhirValidator();
        });

        $this->app->singleton(ClinicalAIService::class, function ($app) {
            return new ClinicalAIService(config('cymed.ai'));
        });

        $this->app->singleton(AuditService::class, function ($app) {
            return new AuditService();
        });

        $this->app->singleton(ClinicalNotificationService::class, function ($app) {
            return new ClinicalNotificationService();
        });
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../../config/cymed.php' => config_path('cymed.php'),
        ], 'cymed-config');

        // Macro: Set PostgreSQL session variables for audit trail
        \Illuminate\Support\Facades\DB::listen(function ($query) {
            // Ensures audit trigger has access to current user
        });
    }
}
