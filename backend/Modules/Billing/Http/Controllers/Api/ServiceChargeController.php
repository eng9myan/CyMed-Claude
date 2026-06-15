<?php

namespace Modules\Billing\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Billing\Models\ServiceCharge;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Encounter;

class ServiceChargeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['billing.charges.view', 'patients.view'])) {
            abort(403);
        }

        $charges = ServiceCharge::with(['patient:id,first_name,last_name,mrn', 'postedBy:id,first_name,last_name'])
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('charged_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $charges->items(),
            'meta' => [
                'total' => $charges->total(),
                'per_page' => $charges->perPage(),
                'current_page' => $charges->currentPage(),
                'last_page' => $charges->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('billing.charges.post')) {
            abort(403);
        }

        $validated = $request->validate([
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'service_id' => ['required', 'uuid', 'exists:service_catalog,id'],
            'service_date' => ['required', 'date'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'between:0,100'],
            'coverage_type' => ['nullable', 'in:insured,cash,charity,government,discount'],
            'insurance_id' => ['nullable', 'uuid', 'exists:patient_insurances,id'],
            'icd_diagnoses' => ['nullable', 'array'],
        ]);

        $quantity = $validated['quantity'];
        $unitPrice = $validated['unit_price'];
        $discountPct = $validated['discount_percent'] ?? 0;

        $encounter = Encounter::select('facility_id')->find($validated['encounter_id']);
        $facility = $encounter ? Facility::select('vat_rate')->find($encounter->facility_id) : null;
        $taxPct = (float) ($facility->vat_rate ?? 0);

        $gross = $quantity * $unitPrice;
        $discountAmt = round($gross * $discountPct / 100, 2);
        $net = round($gross - $discountAmt, 2);
        $taxAmt = round($net * $taxPct / 100, 2);
        $total = round($net + $taxAmt, 2);

        $validated['gross_amount'] = $gross;
        $validated['discount_amount'] = $discountAmt;
        $validated['discount_percent'] = $discountPct;
        $validated['tax_percent'] = $taxPct;
        $validated['tax_amount'] = $taxAmt;
        $validated['net_amount'] = $net;
        $validated['total_amount'] = $total;
        $validated['charged_at'] = now();
        $validated['posted_by'] = $authUser->id;
        $validated['status'] = 'pending';
        $validated['coverage_type'] ??= 'cash';

        $charge = ServiceCharge::create($validated);

        return response()->json([
            'data' => $charge->load('postedBy:id,first_name,last_name'),
            'message' => 'Charge posted.',
        ], 201);
    }

    public function show(Request $request, ServiceCharge $charge): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['billing.charges.view', 'patients.view'])) {
            abort(403);
        }

        return response()->json(['data' => $charge->load(['patient', 'postedBy:id,first_name,last_name'])]);
    }

    public function update(Request $request, ServiceCharge $charge): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('billing.charges.post')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:pending,approved,billed,paid,adjusted,voided,on_hold'],
            'void_reason' => ['required_if:status,voided', 'nullable', 'string'],
        ]);

        if (($validated['status'] ?? null) === 'voided') {
            $validated['voided_by'] = $authUser->id;
        }

        $charge->update($validated);

        return response()->json(['data' => $charge->fresh()]);
    }

    public function destroy(ServiceCharge $charge): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('billing.charges.void')) {
            abort(403);
        }

        $charge->update(['status' => 'voided', 'voided_by' => $authUser->id]);
        $charge->delete();

        return response()->json(null, 204);
    }
}
