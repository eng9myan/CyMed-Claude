<?php

namespace Modules\Pharmacy\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Pharmacy\Models\MedicationAdministration;
use Modules\Pharmacy\Models\MedicationOrder;

class MarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['pharmacy.mar.view', 'patients.view'])) {
            abort(403);
        }

        $records = MedicationAdministration::with([
            'medicationOrder:id,drug_name,dose,route,frequency',
            'administeredBy:id,first_name,last_name',
        ])
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('scheduled_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $records->items(),
            'meta' => [
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.mar.document')) {
            abort(403);
        }

        $validated = $request->validate([
            'medication_order_id' => ['required', 'uuid', 'exists:medication_orders,id'],
            'scheduled_at' => ['required', 'date'],
            'administered_at' => ['nullable', 'date'],
            'status' => ['required', 'in:given,held,refused,missed,not_applicable'],
            'dose_given' => ['nullable', 'string', 'max:50'],
            'dose_unit' => ['nullable', 'string', 'max:20'],
            'route_given' => ['nullable', 'string', 'max:30'],
            'site' => ['nullable', 'string', 'max:50'],
            'hold_reason' => ['required_if:status,held', 'nullable', 'string'],
            'refuse_reason' => ['required_if:status,refused', 'nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $order = MedicationOrder::findOrFail($validated['medication_order_id']);

        $validated['patient_id'] = $order->patient_id;
        $validated['encounter_id'] = $order->encounter_id;
        $validated['administered_by'] = $authUser->id;

        if ($validated['status'] === 'given' && empty($validated['administered_at'])) {
            $validated['administered_at'] = now();
        }

        $record = MedicationAdministration::create($validated);

        return response()->json([
            'data' => $record->load('administeredBy:id,first_name,last_name'),
            'message' => 'Administration documented.',
        ], 201);
    }

    public function show(Request $request, MedicationAdministration $mar): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['pharmacy.mar.view', 'patients.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $mar->load(['medicationOrder', 'administeredBy:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, MedicationAdministration $mar): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pharmacy.mar.document')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:given,held,refused,missed,not_applicable'],
            'administered_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
            'hold_reason' => ['nullable', 'string'],
        ]);

        $mar->update($validated);

        return response()->json(['data' => $mar->fresh()]);
    }

    public function destroy(MedicationAdministration $mar): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('pharmacy.mar.document')) {
            abort(403);
        }

        $mar->delete();

        return response()->json(null, 204);
    }
}
