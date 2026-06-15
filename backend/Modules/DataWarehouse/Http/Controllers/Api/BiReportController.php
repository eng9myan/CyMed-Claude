<?php

namespace Modules\DataWarehouse\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\DataWarehouse\Models\BiReportDefinition;
use Modules\DataWarehouse\Models\ReportSchedule;

class BiReportController extends Controller
{
    public function reports(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $query = BiReportDefinition::where('facility_id', $validated['facility_id'])
            ->where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $reports = $query->orderBy('category')->orderBy('report_name')->get();

        return response()->json(['data' => $reports]);
    }

    public function createReport(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.financial.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'report_code' => ['required', 'string', 'max:50', 'unique:bi_report_definitions,report_code'],
            'report_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:clinical,financial,operational,quality'],
            'parameters' => ['nullable', 'array'],
            'output_columns' => ['nullable', 'array'],
            'refresh_frequency' => ['sometimes', 'in:realtime,hourly,daily,weekly,on_demand'],
        ]);

        $report = BiReportDefinition::create(array_merge($validated, [
            'parameters' => $validated['parameters'] ?? [],
            'output_columns' => $validated['output_columns'] ?? [],
            'created_by' => $authUser->id,
        ]));

        return response()->json([
            'data' => $report,
            'message' => 'BI report definition created.',
        ], 201);
    }

    public function scheduleReport(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'report_id' => ['required', 'uuid', 'exists:bi_report_definitions,id'],
            'frequency' => ['required', 'in:daily,weekly,monthly'],
            'delivery_channel' => ['required', 'in:email,push,in_app'],
            'recipient' => ['required', 'string', 'max:255'],
            'parameter_values' => ['nullable', 'array'],
        ]);

        $schedule = ReportSchedule::create(array_merge($validated, [
            'user_id' => $authUser->id,
            'parameter_values' => $validated['parameter_values'] ?? [],
            'next_run_at' => now()->addDay(),
        ]));

        return response()->json([
            'data' => $schedule,
            'message' => 'Report schedule created.',
        ], 201);
    }
}
