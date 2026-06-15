<?php

namespace Modules\RPM\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\RPM\Models\RpmAlert;
use Modules\RPM\Models\RpmDevice;
use Modules\RPM\Models\RpmReading;

class RpmController extends Controller
{
    public function enrollDevice(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rpm.devices.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'device_type' => ['required', 'in:pulse_oximeter,bp_monitor,glucometer,ecg,weight_scale,thermometer'],
            'device_id' => ['required', 'string', 'max:50', 'unique:rpm_devices,device_id'],
            'manufacturer' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'alert_thresholds' => ['nullable', 'array'],
        ]);

        $validated['enrolled_by'] = $authUser->id;
        $validated['enrolled_at'] = now();

        $device = RpmDevice::create($validated);

        return response()->json([
            'data' => $device->load(['patient:id,first_name,last_name,mrn']),
            'message' => 'Device enrolled.',
        ], 201);
    }

    public function recordReading(Request $request, RpmDevice $device): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rpm.devices.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'metric' => ['required', 'in:spo2,heart_rate,bp_systolic,bp_diastolic,blood_glucose,weight,temperature,ecg_hr'],
            'value' => ['required', 'numeric'],
            'unit' => ['required', 'string', 'max:10'],
            'reading_at' => ['nullable', 'date'],
        ]);

        $validated['device_id'] = $device->id;
        $validated['patient_id'] = $device->patient_id;
        $validated['reading_at'] = $validated['reading_at'] ?? now();

        // Check alert thresholds
        $isAlert = false;
        $alertSeverity = null;
        $thresholds = $device->alert_thresholds ?? [];

        if (isset($thresholds[$validated['metric']])) {
            $t = $thresholds[$validated['metric']];
            $val = (float) $validated['value'];
            if (isset($t['min']) && $val < $t['min']) {
                $isAlert = true;
                $alertSeverity = ($val < ($t['critical_min'] ?? $t['min'] - 5)) ? 'critical' : 'high';
            }
            if (isset($t['max']) && $val > $t['max']) {
                $isAlert = true;
                $alertSeverity = ($val > ($t['critical_max'] ?? $t['max'] + 5)) ? 'critical' : 'high';
            }
        }

        $validated['is_alert'] = $isAlert;
        $validated['alert_severity'] = $alertSeverity;

        $reading = RpmReading::create($validated);

        $device->update(['last_reading_at' => $reading->reading_at]);

        // Create alert record if triggered
        if ($isAlert) {
            RpmAlert::create([
                'reading_id' => $reading->id,
                'patient_id' => $device->patient_id,
                'device_id' => $device->id,
                'metric' => $validated['metric'],
                'value' => $validated['value'],
                'severity' => $alertSeverity,
                'message' => "Alert: {$validated['metric']} = {$validated['value']} {$validated['unit']} is out of normal range.",
            ]);
        }

        return response()->json([
            'data' => $reading,
            'alert_generated' => $isAlert,
            'message' => 'Reading recorded.',
        ], 201);
    }

    public function alerts(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['rpm.alerts.view', 'rpm.alerts.acknowledge'])) {
            abort(403);
        }

        $alerts = RpmAlert::with(['patient:id,first_name,last_name,mrn', 'acknowledgedBy:id,first_name,last_name'])
            ->when(! $request->boolean('include_acknowledged'), fn ($q) => $q->where('acknowledged', false))
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->severity, fn ($q, $v) => $q->where('severity', $v))
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $alerts->items(),
            'meta' => [
                'total' => $alerts->total(),
                'per_page' => $alerts->perPage(),
                'current_page' => $alerts->currentPage(),
                'last_page' => $alerts->lastPage(),
            ],
        ]);
    }

    public function acknowledgeAlert(Request $request, RpmAlert $alert): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('rpm.alerts.acknowledge')) {
            abort(403);
        }

        if ($alert->acknowledged) {
            return response()->json(['message' => 'Alert already acknowledged.'], 422);
        }

        $validated = $request->validate([
            'action_taken' => ['nullable', 'string', 'max:500'],
        ]);

        $alert->update([
            'acknowledged' => true,
            'acknowledged_by' => $authUser->id,
            'acknowledged_at' => now(),
            'action_taken' => $validated['action_taken'] ?? null,
        ]);

        return response()->json([
            'data' => $alert->fresh(),
            'message' => 'Alert acknowledged.',
        ]);
    }

    public function patientDevices(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['rpm.devices.manage', 'rpm.alerts.view'])) {
            abort(403);
        }

        $devices = RpmDevice::where('patient_id', $patientId)
            ->where('is_active', true)
            ->with(['enrolledBy:id,first_name,last_name'])
            ->get();

        return response()->json(['data' => $devices]);
    }
}
