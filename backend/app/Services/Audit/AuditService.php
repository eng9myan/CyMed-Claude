<?php

namespace App\Services\Audit;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuditService
{
    public function logPhiAccess(string $resourceType, string $resourceId, string $action, array $context = []): void
    {
        activity('phi_access')
            ->causedBy(Auth::user())
            ->withProperties(array_merge([
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'action' => $action,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'url' => request()->fullUrl(),
                'timestamp' => now()->toIso8601String(),
            ], $context))
            ->log("PHI {$action}: {$resourceType}/{$resourceId}");

        // Set PostgreSQL session variable for DB-level audit
        // Uses set_config() instead of SET LOCAL to support parameterized queries
        try {
            DB::statement("SELECT set_config('app.current_user_id', ?, true)", [Auth::id() ?? 'system']);
            DB::statement("SELECT set_config('app.current_ip', ?, true)", [request()->ip() ?? '']);
        } catch (\Exception $e) {
            // Non-fatal
        }
    }

    public function logClinicalEvent(string $event, string $patientId, string $encounterId, array $data = []): void
    {
        activity('clinical')
            ->causedBy(Auth::user())
            ->withProperties(array_merge([
                'patient_id' => $patientId,
                'encounter_id' => $encounterId,
                'ip_address' => request()->ip(),
                'timestamp' => now()->toIso8601String(),
            ], $data))
            ->log($event);
    }

    public function logSecurityEvent(string $event, array $data = []): void
    {
        activity('security')
            ->causedBy(Auth::user())
            ->withProperties(array_merge([
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'timestamp' => now()->toIso8601String(),
            ], $data))
            ->log($event);

        // Also log to system log for SIEM
        Log::channel('security')->warning("Security Event: {$event}", $data);
    }
}
