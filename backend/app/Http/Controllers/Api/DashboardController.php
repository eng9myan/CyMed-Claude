<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function census(Request $request): JsonResponse
    {
        return response()->json([
            'inpatient' => [
                'total_beds' => 0,
                'occupied' => 0,
                'available' => 0,
                'occupancy_rate' => 0,
            ],
            'emergency' => [
                'waiting' => 0,
                'in_treatment' => 0,
                'average_wait_minutes' => 0,
            ],
            'outpatient' => [
                'today_appointments' => 0,
                'arrived' => 0,
                'completed' => 0,
                'no_show' => 0,
            ],
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    public function kpi(Request $request): JsonResponse
    {
        return response()->json([
            'alos' => 0,
            'occupancy_rate' => 0,
            'er_wait_time_minutes' => 0,
            'claim_denial_rate' => 0,
            'patient_satisfaction' => 0,
            'readmission_rate_30d' => 0,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    public function alerts(Request $request): JsonResponse
    {
        return response()->json([
            'critical_labs' => [],
            'news2_high' => [],
            'bed_alerts' => [],
            'total_count' => 0,
        ]);
    }
}
