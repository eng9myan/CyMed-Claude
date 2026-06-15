<?php

namespace Modules\LabAnalyzer\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\LabAnalyzer\Models\LabAnalyzer;
use Modules\LabAnalyzer\Models\PoctResult;

class LabAnalyzerController extends Controller
{
    public function analyzers(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('lab.analyzers.view')) {
            abort(403);
        }

        $query = LabAnalyzer::query();

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('analyzer_type')) {
            $query->where('analyzer_type', $request->analyzer_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $analyzers = $query->orderBy('device_name')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $analyzers->items(),
            'meta' => [
                'total' => $analyzers->total(),
                'per_page' => $analyzers->perPage(),
                'current_page' => $analyzers->currentPage(),
                'last_page' => $analyzers->lastPage(),
            ],
        ]);
    }

    public function registerAnalyzer(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('lab.analyzers.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'device_id' => ['required', 'string', 'max:50', 'unique:lab_analyzers,device_id'],
            'device_name' => ['required', 'string', 'max:200'],
            'manufacturer' => ['nullable', 'string', 'max:150'],
            'model' => ['nullable', 'string', 'max:100'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'department' => ['nullable', 'string', 'max:100'],
            'analyzer_type' => ['required', 'in:hematology,chemistry,immunoassay,coagulation,urinalysis,microbiology,poct'],
            'connection_type' => ['nullable', 'in:hl7,astm,serial,tcp_ip'],
            'ip_address' => ['nullable', 'ip'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
        ]);

        $analyzer = LabAnalyzer::create(array_merge($validated, [
            'status' => 'active',
            'connection_type' => $validated['connection_type'] ?? 'hl7',
        ]));

        return response()->json([
            'data' => $analyzer,
            'message' => 'Analyzer registered.',
        ], 201);
    }

    public function postResult(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('lab.results.verify')) {
            abort(403);
        }

        $validated = $request->validate([
            'lab_analyzer_id' => ['required', 'uuid', 'exists:lab_analyzers,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'test_name' => ['required', 'string', 'max:100'],
            'test_code' => ['nullable', 'string', 'max:30'],
            'result_value' => ['required', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:30'],
            'reference_range' => ['nullable', 'string', 'max:100'],
            'interpretation' => ['nullable', 'in:normal,low,high,critical_low,critical_high'],
            'is_critical' => ['nullable', 'boolean'],
            'result_at' => ['nullable', 'date_format:Y-m-d H:i:s'],
        ]);

        $isCritical = $validated['is_critical']
            ?? in_array($validated['interpretation'] ?? '', ['critical_low', 'critical_high']);

        $result = PoctResult::create(array_merge($validated, [
            'ordered_by' => $authUser->id,
            'is_critical' => $isCritical,
            'result_at' => $validated['result_at'] ?? now(),
        ]));

        return response()->json([
            'data' => $result->load('patient:id,first_name,last_name,mrn'),
            'message' => 'POCT result posted.',
        ], 201);
    }

    public function acknowledgeCritical(Request $request, PoctResult $poctResult): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('lab.critical.acknowledge')) {
            abort(403);
        }

        $poctResult->update([
            'critical_acknowledged' => true,
            'acknowledged_by' => $authUser->id,
        ]);

        return response()->json([
            'data' => $poctResult->fresh(),
            'message' => 'Critical result acknowledged.',
        ]);
    }

    public function pendingCriticals(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('lab.critical.acknowledge')) {
            abort(403);
        }

        $results = PoctResult::where('is_critical', true)
            ->where('critical_acknowledged', false)
            ->with([
                'patient:id,first_name,last_name,mrn',
                'analyzer:id,device_name,department',
            ])
            ->orderBy('result_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $results->items(),
            'meta' => [
                'total' => $results->total(),
                'per_page' => $results->perPage(),
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
            ],
        ]);
    }
}
