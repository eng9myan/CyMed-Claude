<?php

namespace Modules\Ambulance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Ambulance\Models\Ambulance;
use Modules\Ambulance\Models\AmbulanceDispatch;

class DispatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ambulance.dispatch')) {
            abort(403);
        }

        $dispatches = AmbulanceDispatch::with(['ambulance', 'patient:id,first_name,last_name,mrn', 'dispatchedBy:id,first_name,last_name'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->date, fn ($q, $v) => $q->whereDate('dispatch_at', $v))
            ->orderByDesc('dispatch_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $dispatches->items(),
            'meta' => [
                'total' => $dispatches->total(),
                'per_page' => $dispatches->perPage(),
                'current_page' => $dispatches->currentPage(),
                'last_page' => $dispatches->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ambulance.dispatch')) {
            abort(403);
        }

        $validated = $request->validate([
            'ambulance_id' => ['required', 'uuid', 'exists:ambulances,id'],
            'patient_id' => ['nullable', 'uuid', 'exists:patients,id'],
            'incident_type' => ['required', 'in:medical,trauma,cardiac,stroke,maternity,transfer,other'],
            'priority' => ['nullable', 'integer', 'between:1,5'],
            'pickup_address' => ['nullable', 'string', 'max:500'],
            'destination_facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
            'destination_address' => ['nullable', 'string', 'max:500'],
            'dispatch_notes' => ['nullable', 'string'],
        ]);

        $ambulance = Ambulance::findOrFail($validated['ambulance_id']);

        if ($ambulance->status !== 'available') {
            return response()->json(['message' => 'Ambulance is not available.'], 422);
        }

        $validated['incident_number'] = AmbulanceDispatch::generateIncidentNumber();
        $validated['status'] = 'dispatched';
        $validated['dispatch_at'] = now();
        $validated['dispatched_by'] = $authUser->id;

        $dispatch = AmbulanceDispatch::create($validated);
        $ambulance->update(['status' => 'dispatched']);

        return response()->json([
            'data' => $dispatch->load(['ambulance', 'dispatchedBy:id,first_name,last_name']),
            'message' => 'Ambulance dispatched.',
        ], 201);
    }

    public function show(Request $request, AmbulanceDispatch $dispatch): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ambulance.dispatch')) {
            abort(403);
        }

        return response()->json([
            'data' => $dispatch->load(['ambulance', 'patient:id,first_name,last_name,mrn', 'dispatchedBy:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, AmbulanceDispatch $dispatch): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('ambulance.dispatch')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['nullable', 'in:dispatched,en_route,on_scene,transporting,completed,cancelled'],
            'en_route_at' => ['nullable', 'date'],
            'on_scene_at' => ['nullable', 'date'],
            'departed_scene_at' => ['nullable', 'date'],
            'arrived_at' => ['nullable', 'date'],
            'outcome' => ['nullable', 'in:transported,refused,treated_on_scene,deceased,cancelled'],
            'dispatch_notes' => ['nullable', 'string'],
        ]);

        if (isset($validated['status']) && in_array($validated['status'], ['completed', 'cancelled'])) {
            $validated['closed_at'] = now();
            $dispatch->ambulance->update(['status' => 'available']);
        }

        $dispatch->update($validated);

        return response()->json([
            'data' => $dispatch->fresh(),
            'message' => 'Dispatch updated.',
        ]);
    }
}
