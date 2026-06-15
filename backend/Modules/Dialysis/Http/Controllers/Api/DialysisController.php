<?php

namespace Modules\Dialysis\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Dialysis\Models\DialysisSession;

class DialysisController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['dialysis.view', 'dialysis.manage'])) {
            abort(403);
        }

        $sessions = DialysisSession::query()
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->with([
                'patient:id,first_name,last_name,mrn',
                'performedBy:id,first_name,last_name',
            ])
            ->orderByDesc('scheduled_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'total' => $sessions->total(),
                'per_page' => $sessions->perPage(),
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dialysis.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'session_type' => ['required', 'in:hd,pd,crrt'],
            'machine_id' => ['nullable', 'string', 'max:50'],
            'access_type' => ['required', 'in:avf,avg,tunneled_catheter,temporary_catheter,peritoneal_catheter'],
            'scheduled_at' => ['required', 'date'],
            'planned_duration_hours' => ['required', 'numeric', 'min:0.5', 'max:24'],
            'pre_weight_kg' => ['nullable', 'numeric', 'min:20', 'max:300'],
            'pre_bp_systolic' => ['nullable', 'integer', 'min:60', 'max:250'],
            'pre_bp_diastolic' => ['nullable', 'integer', 'min:30', 'max:160'],
            'blood_flow_rate' => ['nullable', 'integer', 'min:50', 'max:600'],
            'dialysate_flow_rate' => ['nullable', 'integer', 'min:100', 'max:1000'],
        ]);

        $validated['session_number'] = DialysisSession::generateSessionNumber();
        $validated['status'] = 'scheduled';
        $validated['performed_by'] = $authUser->id;

        $session = DialysisSession::create($validated);

        return response()->json([
            'data' => $session->load(['patient:id,first_name,last_name,mrn', 'performedBy:id,first_name,last_name']),
            'message' => 'Dialysis session scheduled.',
        ], 201);
    }

    public function start(Request $request, DialysisSession $session): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dialysis.manage')) {
            abort(403);
        }

        $session->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json([
            'data' => $session->fresh(),
            'message' => 'Dialysis session started.',
        ]);
    }

    public function complete(Request $request, DialysisSession $session): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dialysis.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'post_weight_kg' => ['nullable', 'numeric', 'min:20', 'max:300'],
            'fluid_removed_liters' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'kt_v' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'post_bp_systolic' => ['nullable', 'integer', 'min:60', 'max:250'],
            'post_bp_diastolic' => ['nullable', 'integer', 'min:30', 'max:160'],
            'complications' => ['nullable', 'string'],
        ]);

        $endedAt = now();
        $actualDuration = null;

        if ($session->started_at) {
            $actualDuration = round($session->started_at->diffInMinutes($endedAt) / 60, 2);
        }

        $validated['status'] = 'completed';
        $validated['ended_at'] = $endedAt;
        $validated['actual_duration_hours'] = $actualDuration;

        $session->update($validated);

        return response()->json([
            'data' => $session->fresh(),
            'message' => 'Dialysis session completed.',
        ]);
    }

    public function patientSessions(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['dialysis.view', 'dialysis.manage'])) {
            abort(403);
        }

        $sessions = DialysisSession::where('patient_id', $patientId)
            ->with(['performedBy:id,first_name,last_name'])
            ->orderByDesc('scheduled_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'total' => $sessions->total(),
                'per_page' => $sessions->perPage(),
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }
}
