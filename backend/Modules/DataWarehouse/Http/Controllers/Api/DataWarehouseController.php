<?php

namespace Modules\DataWarehouse\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\DataWarehouse\Models\EncounterFact;
use Modules\DataWarehouse\Models\FinancialFact;
use Modules\DataWarehouse\Models\LabFact;

class DataWarehouseController extends Controller
{
    public function encounterMetrics(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dw.reports.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'date_from'   => ['nullable', 'date'],
            'date_to'     => ['nullable', 'date'],
        ]);

        $query = EncounterFact::where('facility_id', $validated['facility_id']);

        if (! empty($validated['date_from'])) {
            $query->where('encounter_date', '>=', $validated['date_from']);
        }
        if (! empty($validated['date_to'])) {
            $query->where('encounter_date', '<=', $validated['date_to']);
        }

        $total   = $query->count();
        $avgLos  = $query->avg('los_days');
        $grouped = $query->selectRaw('encounter_type, count(*) as count, avg(los_days) as avg_los')
            ->groupBy('encounter_type')
            ->get();

        return response()->json([
            'total_encounters' => $total,
            'avg_los_days'     => round((float) $avgLos, 2),
            'by_type'          => $grouped,
        ]);
    }

    public function labMetrics(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dw.reports.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $stats = LabFact::where('facility_id', $validated['facility_id'])
            ->selectRaw('test_category, count(*) as total, avg(turnaround_hours) as avg_turnaround, sum(case when is_abnormal then 1 else 0 end) as abnormal_count')
            ->groupBy('test_category')
            ->get();

        return response()->json(['data' => $stats]);
    }

    public function financialSummary(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dw.reports.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'fiscal_year' => ['nullable', 'string'],
        ]);

        $query = FinancialFact::where('facility_id', $validated['facility_id']);

        if (! empty($validated['fiscal_year'])) {
            $query->where('period_year', (int) $validated['fiscal_year']);
        }

        $data = $query->selectRaw('period_year, period_month, revenue_type, sum(amount) as total_amount')
            ->groupBy('period_year', 'period_month', 'revenue_type')
            ->orderBy('period_year')
            ->orderBy('period_month')
            ->get();

        return response()->json(['data' => $data]);
    }

    public function populateDateDim(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dw.reports.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'            => ['required', 'uuid', 'exists:facilities,id'],
            'encounter_id'           => ['nullable', 'uuid'],
            'encounter_date'         => ['required', 'date'],
            'encounter_type'         => ['required', 'string'],
            'total_charges'          => ['nullable', 'numeric'],
            'los_days'               => ['nullable', 'integer'],
        ]);

        $fact = EncounterFact::create($validated);

        return response()->json(['message' => 'Fact recorded.', 'data' => $fact], 201);
    }
}
