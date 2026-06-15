<?php

namespace Modules\Compliance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Compliance\Models\DeviceReading;
use Modules\Compliance\Models\MedicalDevice;

class MedicalDevicesController extends Controller
{
    public function devices(Request $request): JsonResponse
    {
        $query = MedicalDevice::query()->where('is_active', true);

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        return response()->json(['data' => $query->orderBy('device_name')->get()]);
    }

    public function registerDevice(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('integration.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'      => ['required', 'uuid', 'exists:facilities,id'],
            'device_code'      => ['required', 'string', 'max:50', 'unique:medical_devices,device_code'],
            'device_name'      => ['required', 'string', 'max:255'],
            'device_type'      => ['required', 'in:vitals_monitor,infusion_pump,ventilator,ecg,other'],
            'manufacturer'     => ['nullable', 'string', 'max:255'],
            'model_number'     => ['nullable', 'string', 'max:100'],
            'serial_number'    => ['required', 'string', 'max:100', 'unique:medical_devices,serial_number'],
            'location'         => ['nullable', 'string', 'max:255'],
            'integration_type' => ['sometimes', 'in:manual,hl7,fhir,proprietary'],
        ]);

        $device = MedicalDevice::create($validated);

        return response()->json([
            'data'    => $device,
            'message' => 'Medical device registered.',
        ], 201);
    }

    public function deviceReadings(Request $request, string $deviceId): JsonResponse
    {
        MedicalDevice::findOrFail($deviceId);

        $readings = DeviceReading::where('device_id', $deviceId)
            ->orderByDesc('reading_at')
            ->paginate((int) ($request->per_page ?? 50));

        return response()->json([
            'data' => $readings->items(),
            'meta' => [
                'total'        => $readings->total(),
                'per_page'     => $readings->perPage(),
                'current_page' => $readings->currentPage(),
                'last_page'    => $readings->lastPage(),
            ],
        ]);
    }

    public function postReading(Request $request, string $deviceId): JsonResponse
    {
        MedicalDevice::findOrFail($deviceId);

        $validated = $request->validate([
            'patient_id'    => ['nullable', 'uuid', 'exists:patients,id'],
            'encounter_id'  => ['nullable', 'uuid', 'exists:encounters,id'],
            'reading_type'  => ['required', 'string', 'max:50'],
            'reading_value' => ['required', 'string', 'max:100'],
            'unit'          => ['nullable', 'string', 'max:30'],
            'reading_at'    => ['required', 'date'],
            'is_critical'   => ['sometimes', 'boolean'],
        ]);

        $reading = DeviceReading::create(array_merge($validated, [
            'device_id'      => $deviceId,
            'transmitted_at' => now(),
        ]));

        return response()->json([
            'data'    => $reading,
            'message' => 'Reading recorded.',
        ], 201);
    }

    public function criticalReadings(Request $request): JsonResponse
    {
        $readings = DeviceReading::where('is_critical', true)
            ->with('device')
            ->orderByDesc('reading_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $readings->items(),
            'meta' => [
                'total'        => $readings->total(),
                'per_page'     => $readings->perPage(),
                'current_page' => $readings->currentPage(),
                'last_page'    => $readings->lastPage(),
            ],
        ]);
    }
}
