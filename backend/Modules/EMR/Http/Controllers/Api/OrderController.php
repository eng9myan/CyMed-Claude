<?php

namespace Modules\EMR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Patient\Models\Encounter;
use Modules\Pharmacy\Models\MedicationOrder;

class OrderController extends Controller
{
    public function index(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.orders.view', 'patients.view'])) {
            abort(403);
        }

        $orders = MedicationOrder::where('encounter_id', $encounter->id)
            ->with('orderedBy:id,first_name,last_name')
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('ordered_at')
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function store(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.orders.create', 'pharmacy.prescribe'])) {
            abort(403);
        }

        $validated = $request->validate([
            'drug_name' => ['required', 'string', 'max:255'],
            'dose' => ['required', 'string', 'max:50'],
            'dose_unit' => ['nullable', 'string', 'max:20'],
            'route' => ['required', 'string', 'max:30'],
            'frequency' => ['required', 'string', 'max:30'],
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'indication' => ['nullable', 'string', 'max:255'],
            'priority' => ['nullable', 'in:stat,urgent,asap,routine'],
            'prescriber_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['patient_id'] = $encounter->patient_id;
        $validated['encounter_id'] = $encounter->id;
        $validated['ordered_by'] = $authUser->id;
        $validated['ordered_at'] = now();
        $validated['order_number'] = MedicationOrder::generateOrderNumber();
        $validated['status'] = 'ordered';
        $validated['priority'] ??= 'routine';

        $order = MedicationOrder::create($validated);

        return response()->json([
            'data' => $order->load('orderedBy:id,first_name,last_name'),
            'message' => 'Order placed.',
        ], 201);
    }

    public function show(Request $request, Encounter $encounter, MedicationOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.orders.view', 'patients.view'])) {
            abort(403);
        }

        if ($order->encounter_id !== $encounter->id) {
            abort(404);
        }

        return response()->json(['data' => $order->load('orderedBy:id,first_name,last_name')]);
    }

    public function update(Request $request, Encounter $encounter, MedicationOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['clinical.orders.create', 'pharmacy.prescribe'])) {
            abort(403);
        }

        if ($order->encounter_id !== $encounter->id) {
            abort(404);
        }

        if (! in_array($order->status, ['ordered'])) {
            return response()->json(['message' => 'Only pending orders can be updated.'], 422);
        }

        $validated = $request->validate([
            'drug_name' => ['sometimes', 'string', 'max:255'],
            'dose' => ['sometimes', 'string', 'max:50'],
            'route' => ['sometimes', 'string', 'max:30'],
            'frequency' => ['sometimes', 'string', 'max:30'],
            'indication' => ['nullable', 'string', 'max:255'],
            'prescriber_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->update($validated);

        return response()->json(['data' => $order->fresh()]);
    }

    public function destroy(Encounter $encounter, MedicationOrder $order): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasAnyPermission(['clinical.orders.create', 'pharmacy.prescribe'])) {
            abort(403);
        }

        if ($order->encounter_id !== $encounter->id) {
            abort(404);
        }

        $order->update([
            'status' => 'discontinued',
            'discontinued_at' => now(),
            'discontinued_by' => $authUser->id,
            'discontinued_reason' => 'Cancelled by physician',
        ]);
        $order->delete();

        return response()->json(null, 204);
    }
}
