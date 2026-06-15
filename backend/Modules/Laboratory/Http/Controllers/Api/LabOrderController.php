<?php

namespace Modules\Laboratory\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Laboratory\Models\LabOrder;
use Modules\Laboratory\Models\LabSpecimen;

class LabOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['lab.orders.view', 'patients.view'])) {
            abort(403);
        }

        $orders = LabOrder::with(['patient:id,first_name,last_name,mrn', 'orderedBy:id,first_name,last_name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->priority, fn ($q, $v) => $q->where('priority', $v))
            ->orderByDesc('ordered_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('lab.orders.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'department_id' => ['nullable', 'uuid', 'exists:departments,id'],
            'priority' => ['nullable', 'in:stat,urgent,asap,routine'],
            'specimen_type' => ['nullable', 'string', 'max:30'],
            'collection_method' => ['nullable', 'string', 'max:30'],
            'collection_requested_at' => ['nullable', 'date'],
            'clinical_history' => ['nullable', 'string', 'max:500'],
            'panels' => ['nullable', 'array'],
            'panels.*' => ['uuid', 'exists:lab_panels,id'],
        ]);

        $validated['ordered_by'] = $authUser->id;
        $validated['ordered_at'] = now();
        $validated['order_number'] = LabOrder::generateOrderNumber();
        $validated['status'] = 'ordered';
        $validated['priority'] ??= 'routine';

        $order = LabOrder::create($validated);

        return response()->json([
            'data' => $order->load(['patient:id,first_name,last_name,mrn', 'orderedBy:id,first_name,last_name']),
            'message' => 'Lab order created.',
        ], 201);
    }

    public function show(Request $request, LabOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['lab.orders.view', 'patients.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $order->load(['patient', 'orderedBy:id,first_name,last_name', 'specimens', 'results']),
        ]);
    }

    public function update(Request $request, LabOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['lab.orders.create', 'lab.results.verify'])) {
            abort(403);
        }

        $validated = $request->validate([
            'priority' => ['sometimes', 'in:stat,urgent,asap,routine'],
            'clinical_history' => ['nullable', 'string', 'max:500'],
            'specimen_type' => ['nullable', 'string', 'max:30'],
            'status' => ['sometimes', 'in:ordered,collected,received,processing,resulted,verified,cancelled'],
        ]);

        $order->update($validated);

        return response()->json(['data' => $order->fresh()]);
    }

    public function destroy(LabOrder $order): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('lab.orders.create')) {
            abort(403);
        }

        if (! in_array($order->status, ['ordered'])) {
            return response()->json(['message' => 'Only pending orders can be cancelled.'], 422);
        }

        $order->update(['status' => 'cancelled']);
        $order->delete();

        return response()->json(null, 204);
    }

    public function collect(Request $request, LabOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['lab.results.verify', 'lab.orders.view'])) {
            abort(403);
        }

        if (! in_array($order->status, ['ordered'])) {
            return response()->json(['message' => 'Order has already been collected.'], 422);
        }

        $validated = $request->validate([
            'specimen_type' => ['required', 'string', 'max:30'],
            'container_type' => ['nullable', 'string', 'max:30'],
            'specimen_source' => ['nullable', 'string', 'max:30'],
            'volume_ml' => ['nullable', 'string', 'max:10'],
        ]);

        $accession = 'ACC-' . now()->format('Ymd') . '-' . str_pad((string) (LabSpecimen::count() + 1), 5, '0', STR_PAD_LEFT);

        $specimen = LabSpecimen::create(array_merge($validated, [
            'lab_order_id' => $order->id,
            'accession_number' => $accession,
            'collected_at' => now(),
            'status' => 'collected',
        ]));

        $order->update([
            'status' => 'collected',
            'collected_at' => now(),
            'collected_by' => $authUser->id,
            'specimen_type' => $validated['specimen_type'],
        ]);

        return response()->json([
            'data' => ['order' => $order->fresh(), 'specimen' => $specimen],
            'message' => 'Specimen collected.',
        ]);
    }
}
