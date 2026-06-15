<?php

namespace Modules\Laboratory\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Laboratory\Models\LabOrder;
use Modules\Laboratory\Models\LabResult;

class LabResultController extends Controller
{
    public function index(Request $request, LabOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['lab.results.view', 'patients.view'])) {
            abort(403);
        }

        $results = LabResult::where('lab_order_id', $order->id)
            ->with('verifiedBy:id,first_name,last_name')
            ->orderBy('test_name')
            ->get();

        return response()->json(['data' => $results]);
    }

    public function verify(Request $request, LabResult $result): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('lab.results.verify')) {
            abort(403);
        }

        if ($result->result_status === 'final') {
            return response()->json(['message' => 'Result is already finalized.'], 422);
        }

        $validated = $request->validate([
            'comments' => ['nullable', 'string', 'max:500'],
        ]);

        $result->update(array_merge($validated, [
            'result_status' => 'final',
            'verified_by' => $authUser->id,
            'verified_at' => now(),
        ]));

        // Update order status if all results are final
        $order = $result->labOrder;
        $allFinal = LabResult::where('lab_order_id', $order->id)
            ->where('result_status', '!=', 'final')
            ->doesntExist();

        if ($allFinal) {
            $order->update(['status' => 'verified']);
        }

        return response()->json([
            'data' => $result->fresh()->load('verifiedBy:id,first_name,last_name'),
            'message' => 'Result verified.',
        ]);
    }

    public function criticalAlerts(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['lab.critical.acknowledge', 'lab.results.view'])) {
            abort(403);
        }

        $alerts = LabResult::critical()
            ->unacknowledged()
            ->with(['patient:id,first_name,last_name,mrn', 'labOrder:id,order_number,encounter_id'])
            ->orderByDesc('resulted_at')
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
}
