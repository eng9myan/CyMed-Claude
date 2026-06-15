<?php

namespace Modules\Pharmacy\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Pharmacy\Models\MedicationOrder;

class MedicationOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['pharmacy.verify', 'pharmacy.dispense', 'pharmacy.mar.view', 'patients.view'])) {
            abort(403);
        }

        $orders = MedicationOrder::with([
            'patient:id,first_name,last_name,mrn',
            'orderedBy:id,first_name,last_name',
            'verifiedBy:id,first_name,last_name',
        ])
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
        if (! $authUser->hasPermissionTo('pharmacy.prescribe')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'drug_id' => ['nullable', 'uuid', 'exists:drugs,id'],
            'drug_name' => ['required', 'string', 'max:255'],
            'dose' => ['required', 'string', 'max:50'],
            'dose_unit' => ['nullable', 'string', 'max:20'],
            'route' => ['required', 'string', 'max:30'],
            'frequency' => ['required', 'string', 'max:30'],
            'priority' => ['nullable', 'in:stat,urgent,asap,routine'],
            'is_prn' => ['boolean'],
            'prn_reason' => ['required_if:is_prn,true', 'nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'indication' => ['nullable', 'string', 'max:255'],
            'sig' => ['nullable', 'string', 'max:500'],
            'prescriber_notes' => ['nullable', 'string', 'max:1000'],
            'is_discharge_prescription' => ['boolean'],
        ]);

        $validated['ordered_by'] = $authUser->id;
        $validated['ordered_at'] = now();
        $validated['order_number'] = MedicationOrder::generateOrderNumber();
        $validated['status'] = 'ordered';
        $validated['priority'] ??= 'routine';

        $order = MedicationOrder::create($validated);

        return response()->json([
            'data' => $order->load(['patient:id,first_name,last_name,mrn', 'orderedBy:id,first_name,last_name']),
            'message' => 'Medication order created.',
        ], 201);
    }

    public function show(Request $request, MedicationOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['pharmacy.verify', 'pharmacy.dispense', 'pharmacy.mar.view', 'patients.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $order->load(['patient:id,first_name,last_name,mrn', 'orderedBy:id,first_name,last_name', 'verifiedBy:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, MedicationOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.prescribe')) {
            abort(403);
        }

        if (! in_array($order->status, ['ordered'])) {
            return response()->json(['message' => 'Only pending orders can be modified.'], 422);
        }

        $validated = $request->validate([
            'drug_name' => ['sometimes', 'string', 'max:255'],
            'dose' => ['sometimes', 'string', 'max:50'],
            'route' => ['sometimes', 'string', 'max:30'],
            'frequency' => ['sometimes', 'string', 'max:30'],
            'sig' => ['nullable', 'string', 'max:500'],
            'prescriber_notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'in:discontinued'],
            'discontinued_reason' => ['required_if:status,discontinued', 'nullable', 'string'],
        ]);

        if (($validated['status'] ?? null) === 'discontinued') {
            $validated['discontinued_at'] = now();
            $validated['discontinued_by'] = $authUser->id;
        }

        $order->update($validated);

        return response()->json([
            'data' => $order->fresh(),
            'message' => 'Order updated.',
        ]);
    }

    public function destroy(MedicationOrder $order): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('pharmacy.prescribe')) {
            abort(403);
        }

        $order->update([
            'status' => 'discontinued',
            'discontinued_at' => now(),
            'discontinued_by' => $authUser->id,
        ]);
        $order->delete();

        return response()->json(null, 204);
    }

    public function verify(Request $request, MedicationOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.verify')) {
            abort(403);
        }

        if ($order->status !== 'ordered') {
            return response()->json(['message' => 'Only ordered medications can be verified.'], 422);
        }

        $validated = $request->validate([
            'pharmacist_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->update(array_merge($validated, [
            'status' => 'verified',
            'verified_by' => $authUser->id,
            'verified_at' => now(),
        ]));

        return response()->json([
            'data' => $order->fresh(),
            'message' => 'Order verified.',
        ]);
    }

    public function dispense(Request $request, MedicationOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.dispense')) {
            abort(403);
        }

        if ($order->status !== 'verified') {
            return response()->json(['message' => 'Only verified orders can be dispensed.'], 422);
        }

        $order->update([
            'status' => 'dispensed',
            'dispensed_by' => $authUser->id,
            'dispensed_at' => now(),
        ]);

        return response()->json([
            'data' => $order->fresh(),
            'message' => 'Medication dispensed.',
        ]);
    }
}
