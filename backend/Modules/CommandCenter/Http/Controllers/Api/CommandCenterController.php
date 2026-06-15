<?php

namespace Modules\CommandCenter\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CommandCenter\Models\OperationalAlert;
use Modules\CommandCenter\Models\RealtimeCapacityLog;

class CommandCenterController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('command.center.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $facilityId = $validated['facility_id'];

        $activeAlertsCount = OperationalAlert::where('facility_id', $facilityId)
            ->where('status', 'active')
            ->count();

        $latestCapacity = RealtimeCapacityLog::where('facility_id', $facilityId)
            ->orderByDesc('recorded_at')
            ->first();

        $alertsBySeverity = OperationalAlert::where('facility_id', $facilityId)
            ->where('status', 'active')
            ->selectRaw('severity, count(*) as count')
            ->groupBy('severity')
            ->get()
            ->pluck('count', 'severity');

        return response()->json([
            'active_alerts_count' => $activeAlertsCount,
            'latest_capacity'     => $latestCapacity,
            'alerts_by_severity'  => $alertsBySeverity,
        ]);
    }

    public function activeAlerts(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('command.center.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $alerts = OperationalAlert::where('facility_id', $validated['facility_id'])
            ->where('status', 'active')
            ->get();

        return response()->json(['data' => $alerts]);
    }

    public function triggerAlert(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('command.center.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'alert_type'  => ['required', 'string', 'max:50'],
            'severity'    => ['required', 'in:info,warning,critical'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $alert = OperationalAlert::create(array_merge($validated, [
            'triggered_by' => $authUser->id,
            'triggered_at' => now(),
            'status'       => 'active',
        ]));

        return response()->json($alert, 201);
    }

    public function resolveAlert(Request $request, OperationalAlert $operationalAlert): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('command.center.view')) {
            abort(403);
        }

        $operationalAlert->update([
            'status'      => 'resolved',
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Alert resolved.', 'data' => $operationalAlert]);
    }

    public function recordCapacity(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('command.center.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'  => ['required', 'uuid', 'exists:facilities,id'],
            'total_beds'   => ['required', 'integer'],
            'occupied_beds'=> ['required', 'integer'],
            'icu_beds'     => ['required', 'integer'],
            'icu_occupied' => ['required', 'integer'],
            'ed_boarding'  => ['nullable', 'integer'],
        ]);

        $log = RealtimeCapacityLog::create(array_merge($validated, [
            'recorded_at' => now(),
        ]));

        return response()->json($log, 201);
    }

    public function capacityHistory(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('command.center.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $history = RealtimeCapacityLog::where('facility_id', $validated['facility_id'])
            ->where('recorded_at', '>=', now()->subHours(24))
            ->orderBy('recorded_at')
            ->get();

        return response()->json(['data' => $history]);
    }
}
