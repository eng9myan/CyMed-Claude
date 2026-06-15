<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReportSnapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private function storeSnapshot(string $reportType, array $parameters, array $data, string $userId): void
    {
        DB::table('report_snapshots')->insert([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'report_type' => $reportType,
            'parameters' => json_encode($parameters),
            'data' => json_encode($data),
            'generated_by' => $userId,
            'generated_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function census(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.view')) {
            abort(403);
        }

        $date = $request->input('date', now()->toDateString());

        $totalBeds = DB::table('beds')->count();
        $occupiedBeds = DB::table('bed_assignments')
            ->where('is_current', true)
            ->count();
        $availableBeds = $totalBeds - $occupiedBeds;
        $occupancyRate = $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 2) : 0;

        $admissionsToday = DB::table('encounters')
            ->whereDate('arrived_at', $date)
            ->where('encounter_type', 'inpatient')
            ->whereNull('deleted_at')
            ->count();

        $dischargesToday = DB::table('encounters')
            ->whereDate('discharged_at', $date)
            ->whereNull('deleted_at')
            ->count();

        $emergencyVisitsToday = DB::table('triage_assessments')
            ->whereDate('created_at', $date)
            ->count();

        $data = [
            'total_beds' => $totalBeds,
            'occupied_beds' => $occupiedBeds,
            'available_beds' => $availableBeds,
            'occupancy_rate' => $occupancyRate,
            'admissions_today' => $admissionsToday,
            'discharges_today' => $dischargesToday,
            'emergency_visits_today' => $emergencyVisitsToday,
        ];

        $this->storeSnapshot('census', ['date' => $date], $data, $authUser->id);

        return response()->json(['data' => $data]);
    }

    public function financialSummary(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.view')) {
            abort(403);
        }

        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        $totalCharges = DB::table('service_charges')
            ->whereBetween('service_date', [$from, $to])
            ->whereNull('deleted_at')
            ->sum('total_amount');

        $totalInvoiced = DB::table('invoices')
            ->whereBetween('invoice_date', [$from, $to])
            ->sum('total_amount');

        $totalCollected = DB::table('invoices')
            ->whereBetween('invoice_date', [$from, $to])
            ->sum('paid_amount');

        $outstanding = $totalInvoiced - $totalCollected;

        $byCoverageType = DB::table('service_charges')
            ->select('coverage_type', DB::raw('SUM(total_amount) as total'))
            ->whereBetween('service_date', [$from, $to])
            ->whereNull('deleted_at')
            ->groupBy('coverage_type')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->coverage_type => $row->total])
            ->toArray();

        $data = [
            'total_charges' => round($totalCharges, 2),
            'total_invoiced' => round($totalInvoiced, 2),
            'total_collected' => round($totalCollected, 2),
            'outstanding' => round($outstanding, 2),
            'by_coverage_type' => $byCoverageType,
        ];

        $this->storeSnapshot('financial_summary', ['from' => $from, 'to' => $to], $data, $authUser->id);

        return response()->json(['data' => $data]);
    }

    public function qualityMetrics(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.view')) {
            abort(403);
        }

        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        $totalIncidents = DB::table('incident_reports')
            ->whereBetween(DB::raw('DATE(incident_at)'), [$from, $to])
            ->count();

        $bySeverity = DB::table('incident_reports')
            ->select('severity', DB::raw('COUNT(*) as count'))
            ->whereBetween(DB::raw('DATE(incident_at)'), [$from, $to])
            ->groupBy('severity')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->severity => $row->count])
            ->toArray();

        $byType = DB::table('incident_reports')
            ->select('incident_type', DB::raw('COUNT(*) as count'))
            ->whereBetween(DB::raw('DATE(incident_at)'), [$from, $to])
            ->groupBy('incident_type')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->incident_type => $row->count])
            ->toArray();

        $openIncidents = DB::table('incident_reports')
            ->where('status', 'open')
            ->count();

        $infectionCases = DB::table('infection_cases')
            ->whereBetween(DB::raw('DATE(reported_at)'), [$from, $to])
            ->count();

        $haiCases = DB::table('infection_cases')
            ->whereBetween(DB::raw('DATE(reported_at)'), [$from, $to])
            ->where('case_type', 'hai')
            ->count();

        $data = [
            'total_incidents' => $totalIncidents,
            'by_severity' => $bySeverity,
            'by_type' => $byType,
            'open_incidents' => $openIncidents,
            'infection_cases' => $infectionCases,
            'hai_cases' => $haiCases,
        ];

        $this->storeSnapshot('quality_metrics', ['from' => $from, 'to' => $to], $data, $authUser->id);

        return response()->json(['data' => $data]);
    }

    public function staffingMetrics(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.view')) {
            abort(403);
        }

        $date = $request->input('date', now()->toDateString());

        $totalStaff = DB::table('users')
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->count();

        $byRole = DB::table('users')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->select('roles.name', DB::raw('COUNT(DISTINCT users.id) as count'))
            ->where('users.is_active', true)
            ->whereNull('users.deleted_at')
            ->groupBy('roles.name')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->name => $row->count])
            ->toArray();

        $onLeave = DB::table('leave_requests')
            ->where('status', 'approved')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->count();

        $expiringDate = now()->parse($date)->addDays(30)->toDateString();
        $expiringCredentials = DB::table('staff_credentials')
            ->where('expiry_date', '<=', $expiringDate)
            ->where('expiry_date', '>=', $date)
            ->whereNull('deleted_at')
            ->count();

        $data = [
            'total_staff' => $totalStaff,
            'by_role' => $byRole,
            'on_leave' => $onLeave,
            'expiring_credentials' => $expiringCredentials,
        ];

        $this->storeSnapshot('staffing_metrics', ['date' => $date], $data, $authUser->id);

        return response()->json(['data' => $data]);
    }

    public function operationalKpi(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('reports.view')) {
            abort(403);
        }

        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        $avgLosResult = DB::select(
            "SELECT AVG(EXTRACT(epoch FROM (discharged_at - arrived_at)) / 86400) as avg_los
             FROM encounters
             WHERE discharged_at IS NOT NULL
             AND DATE(discharged_at) BETWEEN ? AND ?
             AND deleted_at IS NULL",
            [$from, $to]
        );
        $avgLos = round($avgLosResult[0]->avg_los ?? 0, 2);

        $totalEncounters = DB::table('encounters')
            ->whereBetween(DB::raw('DATE(arrived_at)'), [$from, $to])
            ->whereNull('deleted_at')
            ->count();

        $byEncounterType = DB::table('encounters')
            ->select('encounter_type', DB::raw('COUNT(*) as count'))
            ->whereBetween(DB::raw('DATE(arrived_at)'), [$from, $to])
            ->whereNull('deleted_at')
            ->groupBy('encounter_type')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->encounter_type => $row->count])
            ->toArray();

        $labTatResult = DB::select(
            "SELECT AVG(EXTRACT(epoch FROM (lr.verified_at - lo.created_at)) / 60) as avg_tat
             FROM lab_results lr
             JOIN lab_orders lo ON lo.id = lr.lab_order_id
             WHERE lr.verified_at IS NOT NULL
             AND DATE(lo.created_at) BETWEEN ? AND ?
             AND lo.deleted_at IS NULL",
            [$from, $to]
        );
        $labTat = round($labTatResult[0]->avg_tat ?? 0, 2);

        $pharmacyOrders = DB::table('medication_orders')
            ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
            ->whereNull('deleted_at')
            ->count();

        $data = [
            'avg_length_of_stay' => $avgLos,
            'total_encounters' => $totalEncounters,
            'by_encounter_type' => $byEncounterType,
            'lab_tat' => $labTat,
            'pharmacy_orders' => $pharmacyOrders,
        ];

        $this->storeSnapshot('operational_kpi', ['from' => $from, 'to' => $to], $data, $authUser->id);

        return response()->json(['data' => $data]);
    }
}
