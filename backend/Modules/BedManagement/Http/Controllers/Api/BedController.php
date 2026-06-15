<?php

namespace Modules\BedManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\BedManagement\Models\Bed;
use Modules\BedManagement\Models\BedAssignment;
use Modules\BedManagement\Models\Ward;

class BedController extends Controller
{
    public function board(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['beds.view', 'beds.assign'])) {
            abort(403);
        }

        $wards = Ward::with([
            'beds' => fn ($q) => $q->with('currentAssignment.patient:id,first_name,last_name,mrn'),
        ])
            ->where('is_active', true)
            ->when($request->ward_type, fn ($q, $v) => $q->where('ward_type', $v))
            ->get();

        $summary = [
            'total' => 0,
            'available' => 0,
            'occupied' => 0,
            'cleaning' => 0,
            'maintenance' => 0,
            'reserved' => 0,
        ];

        foreach ($wards as $ward) {
            foreach ($ward->beds as $bed) {
                $summary['total']++;
                if (isset($summary[$bed->status])) {
                    $summary[$bed->status]++;
                }
            }
        }

        return response()->json([
            'data' => $wards,
            'summary' => $summary,
        ]);
    }

    public function assign(Request $request, Bed $bed): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('beds.assign')) {
            abort(403);
        }

        if ($bed->status !== 'available') {
            return response()->json(['message' => 'Bed is not available.'], 422);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'assignment_reason' => ['nullable', 'in:admission,transfer,upgrade,downgrade'],
            'expected_discharge' => ['nullable', 'date'],
        ]);

        $assignment = BedAssignment::create([
            'bed_id' => $bed->id,
            'patient_id' => $validated['patient_id'],
            'encounter_id' => $validated['encounter_id'],
            'assigned_at' => now(),
            'assignment_reason' => $validated['assignment_reason'] ?? 'admission',
            'assigned_by' => $authUser->id,
            'is_current' => true,
        ]);

        $bed->update([
            'status' => 'occupied',
            'current_patient_id' => $validated['patient_id'],
            'occupied_since' => now(),
            'expected_discharge' => $validated['expected_discharge'] ?? null,
        ]);

        return response()->json([
            'data' => $assignment->load(['bed.ward', 'patient:id,first_name,last_name,mrn']),
            'message' => 'Bed assigned.',
        ], 201);
    }

    public function release(Request $request, Bed $bed): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('beds.assign')) {
            abort(403);
        }

        if ($bed->status !== 'occupied') {
            return response()->json(['message' => 'Bed is not occupied.'], 422);
        }

        $validated = $request->validate([
            'vacate_reason' => ['required', 'in:discharge,transfer,deceased,ama'],
        ]);

        $assignment = BedAssignment::where('bed_id', $bed->id)
            ->where('is_current', true)
            ->first();

        if ($assignment) {
            $assignment->update([
                'vacated_at' => now(),
                'vacated_by' => $authUser->id,
                'vacate_reason' => $validated['vacate_reason'],
                'is_current' => false,
            ]);
        }

        $bed->update([
            'status' => 'cleaning',
            'current_patient_id' => null,
            'occupied_since' => null,
            'expected_discharge' => null,
        ]);

        return response()->json([
            'data' => $bed->fresh(),
            'message' => 'Bed released.',
        ]);
    }

    public function updateStatus(Request $request, Bed $bed): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('beds.assign')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:available,occupied,cleaning,maintenance,reserved,blocked'],
        ]);

        if ($validated['status'] === 'occupied') {
            return response()->json(['message' => 'Use the assign endpoint to occupy a bed.'], 422);
        }

        $bed->update(['status' => $validated['status']]);

        return response()->json([
            'data' => $bed->fresh(),
            'message' => 'Bed status updated.',
        ]);
    }
}
