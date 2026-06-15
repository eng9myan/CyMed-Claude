<?php

namespace Modules\Quality\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Quality\Models\IncidentReport;

class IncidentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['quality.incidents.report', 'quality.incidents.investigate'])) {
            abort(403);
        }

        $reports = IncidentReport::with(['reportedBy:id,first_name,last_name', 'patient:id,first_name,last_name,mrn'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->severity, fn ($q, $v) => $q->where('severity', $v))
            ->when($request->incident_type, fn ($q, $v) => $q->where('incident_type', $v))
            ->orderByDesc('incident_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.incidents.report')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id' => ['nullable', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'incident_at' => ['required', 'date'],
            'incident_type' => ['required', 'in:medication_error,fall,pressure_injury,wrong_patient,near_miss,equipment_failure,delay_in_care,other'],
            'incident_category' => ['required', 'in:patient_safety,staff_safety,visitor,environmental'],
            'severity' => ['required', 'in:no_harm,minor,moderate,major,death,near_miss'],
            'location' => ['nullable', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'immediate_action' => ['required', 'string'],
            'patient_notified' => ['nullable', 'boolean'],
            'physician_notified' => ['nullable', 'boolean'],
            'management_notified' => ['nullable', 'boolean'],
            'external_reporting_required' => ['nullable', 'boolean'],
        ]);

        $validated['report_number'] = IncidentReport::generateReportNumber();
        $validated['status'] = 'open';
        $validated['reported_by'] = $authUser->id;

        $report = IncidentReport::create($validated);

        return response()->json([
            'data' => $report->load(['reportedBy:id,first_name,last_name']),
            'message' => 'Incident reported.',
        ], 201);
    }

    public function show(Request $request, IncidentReport $incident): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['quality.incidents.report', 'quality.incidents.investigate'])) {
            abort(403);
        }

        return response()->json([
            'data' => $incident->load(['reportedBy:id,first_name,last_name', 'assignedTo:id,first_name,last_name', 'patient:id,first_name,last_name,mrn']),
        ]);
    }

    public function update(Request $request, IncidentReport $incident): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.incidents.investigate')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['nullable', 'in:open,under_investigation,closed,rca_required'],
            'assigned_to' => ['nullable', 'uuid', 'exists:users,id'],
            'root_cause' => ['nullable', 'string'],
            'corrective_actions' => ['nullable', 'string'],
            'rca_data' => ['nullable', 'array'],
            'management_notified' => ['nullable', 'boolean'],
            'external_reporting_required' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['status']) && $validated['status'] === 'closed') {
            $validated['closed_by'] = $authUser->id;
            $validated['closed_at'] = now();
        }

        $incident->update($validated);

        return response()->json([
            'data' => $incident->fresh(),
            'message' => 'Incident updated.',
        ]);
    }

    public function destroy(IncidentReport $incident): JsonResponse
    {
        abort(405);
    }
}
