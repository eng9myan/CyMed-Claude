<?php

namespace Modules\Quality\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Quality\Models\RootCauseAnalysis;
use Modules\Quality\Models\SafetyEvent;

class PatientSafetyController extends Controller
{
    public function safetyEvents(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.incidents.report')) {
            abort(403);
        }

        $query = SafetyEvent::query();

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $events = $query->orderByDesc('event_occurred_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'total'        => $events->total(),
                'per_page'     => $events->perPage(),
                'current_page' => $events->currentPage(),
                'last_page'    => $events->lastPage(),
            ],
        ]);
    }

    public function reportEvent(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.incidents.report')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'       => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id'        => ['nullable', 'uuid', 'exists:patients,id'],
            'event_type'        => ['required', 'string', 'max:50'],
            'severity'          => ['required', 'in:low,moderate,serious,sentinel'],
            'description'       => ['required', 'string'],
            'event_occurred_at' => ['required', 'date'],
            'location'          => ['nullable', 'string', 'max:255'],
        ]);

        $year = date('Y');
        $result = DB::select(
            "SELECT COALESCE(MAX(CAST(SPLIT_PART(event_number, '-', 3) AS INTEGER)), 0) + 1 AS next_seq
             FROM safety_events WHERE event_number LIKE ?",
            ["SF-{$year}-%"]
        );
        $seq = str_pad($result[0]->next_seq ?? 1, 5, '0', STR_PAD_LEFT);
        $eventNumber = "SF-{$year}-{$seq}";

        $event = SafetyEvent::create(array_merge($validated, [
            'event_number' => $eventNumber,
            'reported_by'  => $authUser->id,
            'status'       => 'open',
        ]));

        return response()->json([
            'data'    => $event,
            'message' => 'Safety event reported.',
        ], 201);
    }

    public function conductRca(Request $request, string $eventId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.incidents.investigate')) {
            abort(403);
        }

        SafetyEvent::findOrFail($eventId);

        $validated = $request->validate([
            'rca_type'            => ['required', 'in:fishbone,5_why,barrier_analysis'],
            'contributing_factors' => ['required', 'array'],
            'corrective_actions'  => ['required', 'array'],
        ]);

        $rca = RootCauseAnalysis::create(array_merge($validated, [
            'event_id'     => $eventId,
            'conducted_by' => $authUser->id,
            'status'       => 'in_progress',
        ]));

        return response()->json([
            'data'    => $rca,
            'message' => 'RCA initiated.',
        ], 201);
    }
}
