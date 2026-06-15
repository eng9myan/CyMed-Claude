<?php

namespace Modules\AssetManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\AssetManagement\Models\CssdCycle;

class CssdController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cssd.view')) {
            abort(403);
        }

        $cycles = CssdCycle::with(['performedBy:id,first_name,last_name', 'facility:id,name,code'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('started_at')
            ->paginate(20);

        return response()->json([
            'data' => $cycles->items(),
            'meta' => [
                'total' => $cycles->total(),
                'per_page' => $cycles->perPage(),
                'current_page' => $cycles->currentPage(),
                'last_page' => $cycles->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cssd.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'sterilization_method' => ['required', 'in:autoclave,ethylene_oxide,hydrogen_peroxide,dry_heat,chemical'],
            'load_number' => ['required', 'string', 'max:50'],
            'items_count' => ['nullable', 'integer', 'min:0'],
            'biological_indicator' => ['nullable', 'boolean'],
            'operator_notes' => ['nullable', 'string'],
        ]);

        $cycle = CssdCycle::create([
            'cycle_number' => CssdCycle::generateCycleNumber(),
            'facility_id' => $validated['facility_id'],
            'performed_by' => $authUser->id,
            'sterilization_method' => $validated['sterilization_method'],
            'load_number' => $validated['load_number'],
            'items_count' => $validated['items_count'] ?? 0,
            'started_at' => now(),
            'status' => 'in_progress',
            'biological_indicator' => $validated['biological_indicator'] ?? false,
            'operator_notes' => $validated['operator_notes'] ?? null,
        ]);

        return response()->json([
            'data' => $cycle->load(['performedBy:id,first_name,last_name']),
            'message' => 'CSSD cycle started.',
        ], 201);
    }

    public function complete(Request $request, CssdCycle $cycle): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cssd.manage')) {
            abort(403);
        }

        if ($cycle->status !== 'in_progress') {
            return response()->json(['message' => 'Only in-progress cycles can be completed.'], 422);
        }

        $validated = $request->validate([
            'bi_result' => ['nullable', 'in:pass,fail'],
            'operator_notes' => ['nullable', 'string'],
        ]);

        // Determine status based on BI result
        $status = 'passed';
        if (isset($validated['bi_result']) && $validated['bi_result'] === 'fail') {
            $status = 'failed';
        }

        $cycle->update([
            'completed_at' => now(),
            'status' => $status,
            'bi_result' => $validated['bi_result'] ?? null,
            'operator_notes' => $validated['operator_notes'] ?? $cycle->operator_notes,
        ]);

        return response()->json([
            'data' => $cycle->fresh()->load(['performedBy:id,first_name,last_name']),
            'message' => 'CSSD cycle completed.',
        ]);
    }
}
