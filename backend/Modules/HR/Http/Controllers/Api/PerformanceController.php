<?php

namespace Modules\HR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\HR\Models\PerformanceReview;
use Modules\HR\Models\StaffKpi;

class PerformanceController extends Controller
{
    public function reviews(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('hr.staff.manage')) {
            abort(403);
        }

        $query = PerformanceReview::query();

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('reviewee_id')) {
            $query->where('reviewee_id', $request->reviewee_id);
        }

        $reviews = $query->with(['reviewer', 'reviewee'])
            ->orderByDesc('review_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'total'        => $reviews->total(),
                'per_page'     => $reviews->perPage(),
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
        ]);
    }

    public function createReview(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('hr.staff.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'reviewee_id'      => ['required', 'uuid', 'exists:users,id'],
            'facility_id'      => ['required', 'uuid', 'exists:facilities,id'],
            'review_period'    => ['required', 'string', 'max:50'],
            'overall_score'    => ['nullable', 'numeric', 'min:1', 'max:5'],
            'punctuality_score' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'clinical_score'   => ['nullable', 'numeric', 'min:1', 'max:5'],
            'teamwork_score'   => ['nullable', 'numeric', 'min:1', 'max:5'],
            'review_date'      => ['required', 'date'],
            'notes'            => ['nullable', 'string'],
        ]);

        $review = PerformanceReview::create(array_merge($validated, [
            'reviewer_id' => $authUser->id,
            'status'      => 'draft',
        ]));

        return response()->json([
            'data'    => $review,
            'message' => 'Performance review created.',
        ], 201);
    }

    public function kpis(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('hr.staff.manage')) {
            abort(403);
        }

        $query = StaffKpi::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        $kpis = $query->orderByDesc('kpi_month')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $kpis->items(),
            'meta' => [
                'total'        => $kpis->total(),
                'per_page'     => $kpis->perPage(),
                'current_page' => $kpis->currentPage(),
                'last_page'    => $kpis->lastPage(),
            ],
        ]);
    }

    public function recordKpi(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('hr.staff.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id'              => ['required', 'uuid', 'exists:users,id'],
            'facility_id'          => ['required', 'uuid', 'exists:facilities,id'],
            'kpi_month'            => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'patients_seen'        => ['sometimes', 'integer', 'min:0'],
            'procedures_done'      => ['sometimes', 'integer', 'min:0'],
            'on_time_rate'         => ['nullable', 'numeric', 'min:0', 'max:100'],
            'patient_satisfaction' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes'                => ['nullable', 'string'],
        ]);

        $kpi = StaffKpi::updateOrCreate(
            [
                'user_id'     => $validated['user_id'],
                'facility_id' => $validated['facility_id'],
                'kpi_month'   => $validated['kpi_month'],
            ],
            $validated
        );

        return response()->json([
            'data'    => $kpi,
            'message' => 'KPI recorded.',
        ], 201);
    }
}
