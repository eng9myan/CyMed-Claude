<?php

namespace Modules\Core\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\DeploymentNote;
use Modules\Core\Models\SystemHealthCheck;

class DevOpsController extends Controller
{
    public function health(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('devops.view')) {
            abort(403);
        }

        $checks = [];

        // Database check
        try {
            DB::select('SELECT 1');
            $dbStatus = 'healthy';
        } catch (\Exception $e) {
            $dbStatus = 'unhealthy';
        }
        $checks['database'] = $dbStatus;

        // Cache check
        try {
            Cache::put('health_check', 1, 5);
            $cacheStatus = Cache::get('health_check') ? 'healthy' : 'degraded';
        } catch (\Exception $e) {
            $cacheStatus = 'unhealthy';
        }
        $checks['cache'] = $cacheStatus;

        $overallStatus = in_array('unhealthy', $checks) ? 'unhealthy'
            : (in_array('degraded', $checks) ? 'degraded' : 'healthy');

        SystemHealthCheck::create([
            'service_name' => 'api',
            'status' => $overallStatus,
            'details' => json_encode($checks),
            'checked_at' => now(),
        ]);

        return response()->json([
            'status' => $overallStatus,
            'checks' => $checks,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function healthHistory(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('devops.view')) {
            abort(403);
        }

        $checks = SystemHealthCheck::orderByDesc('checked_at')
            ->paginate((int) ($request->per_page ?? 50));

        return response()->json([
            'data' => $checks->items(),
            'meta' => [
                'total' => $checks->total(),
                'per_page' => $checks->perPage(),
                'current_page' => $checks->currentPage(),
                'last_page' => $checks->lastPage(),
            ],
        ]);
    }

    public function deployments(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('devops.view')) {
            abort(403);
        }

        $notes = DeploymentNote::orderByDesc('deployed_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $notes->items(),
            'meta' => [
                'total' => $notes->total(),
                'per_page' => $notes->perPage(),
                'current_page' => $notes->currentPage(),
                'last_page' => $notes->lastPage(),
            ],
        ]);
    }

    public function recordDeployment(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('devops.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'version' => ['required', 'string', 'max:30'],
            'environment' => ['required', 'in:production,staging,development'],
            'release_notes' => ['nullable', 'string'],
            'features_deployed' => ['nullable', 'array'],
            'migrations_run' => ['nullable', 'array'],
        ]);

        $note = DeploymentNote::create(array_merge($validated, [
            'features_deployed' => $validated['features_deployed'] ?? [],
            'migrations_run' => $validated['migrations_run'] ?? [],
            'deployed_by' => $authUser->id,
            'deployed_at' => now(),
        ]));

        return response()->json([
            'data' => $note,
            'message' => 'Deployment recorded.',
        ], 201);
    }
}
