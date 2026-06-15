<?php

namespace Modules\Clinic\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Clinic\Models\Clinic;
use Modules\Clinic\Models\ClinicInvoice;

class ClinicBillingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinic.billing.view')) {
            abort(403);
        }

        $query = ClinicInvoice::query()
            ->with([
                'clinic:id,name,clinic_code',
                'patient:id,first_name,last_name,mrn',
                'cashier:id,first_name,last_name',
            ]);

        if ($request->has('clinic_id')) {
            $query->where('clinic_id', $request->clinic_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderByDesc('invoice_date')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $invoices->items(),
            'meta' => [
                'total' => $invoices->total(),
                'per_page' => $invoices->perPage(),
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinic.billing.post')) {
            abort(403);
        }

        $validated = $request->validate([
            'clinic_id' => ['required', 'uuid', 'exists:clinics,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'invoice_date' => ['nullable', 'date'],
            'visit_type' => ['required', 'in:new,follow_up,procedure,emergency'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'procedure_fees' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'patient_share' => ['nullable', 'numeric', 'min:0'],
        ]);

        $clinic = Clinic::with('facility')->find($validated['clinic_id']);

        $consultationFee = (float) ($validated['consultation_fee'] ?? 0);
        $procedureFees = (float) ($validated['procedure_fees'] ?? 0);
        $discountAmount = (float) ($validated['discount_amount'] ?? 0);

        $subtotal = $consultationFee + $procedureFees - $discountAmount;

        // Get VAT rate from facility
        $vatRate = 0;
        if ($clinic && $clinic->facility) {
            $vatRate = (float) ($clinic->facility->vat_rate ?? 0);
        }

        $vatAmount = round($subtotal * ($vatRate / 100), 2);
        $totalAmount = round($subtotal + $vatAmount, 2);

        $invoice = ClinicInvoice::create([
            'invoice_number' => ClinicInvoice::generateInvoiceNumber(),
            'clinic_id' => $validated['clinic_id'],
            'patient_id' => $validated['patient_id'],
            'cashier_id' => $authUser->id,
            'invoice_date' => $validated['invoice_date'] ?? today()->toDateString(),
            'visit_type' => $validated['visit_type'],
            'consultation_fee' => $consultationFee,
            'procedure_fees' => $procedureFees,
            'discount_amount' => $discountAmount,
            'subtotal' => $subtotal,
            'vat_amount' => $vatAmount,
            'total_amount' => $totalAmount,
            'patient_share' => $validated['patient_share'] ?? $totalAmount,
            'paid_amount' => 0,
            'status' => 'draft',
        ]);

        return response()->json([
            'data' => $invoice->load([
                'clinic:id,name,clinic_code',
                'patient:id,first_name,last_name,mrn',
                'cashier:id,first_name,last_name',
            ]),
            'message' => 'Invoice created successfully.',
        ], 201);
    }

    public function show(ClinicInvoice $clinicInvoice): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('clinic.billing.view')) {
            abort(403);
        }

        return response()->json([
            'data' => $clinicInvoice->load([
                'clinic:id,name,clinic_code',
                'patient:id,first_name,last_name,mrn',
                'cashier:id,first_name,last_name',
            ]),
        ]);
    }

    public function pay(Request $request, ClinicInvoice $clinicInvoice): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinic.billing.post')) {
            abort(403);
        }

        $validated = $request->validate([
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,card,insurance,bank_transfer'],
        ]);

        $paidAmount = (float) $validated['paid_amount'];
        $totalAmount = (float) $clinicInvoice->total_amount;

        if ($paidAmount >= $totalAmount) {
            $status = 'paid';
        } elseif ($paidAmount > 0) {
            $status = 'partially_paid';
        } else {
            $status = $clinicInvoice->status;
        }

        $clinicInvoice->update([
            'paid_amount' => $paidAmount,
            'payment_method' => $validated['payment_method'],
            'status' => $status,
        ]);

        return response()->json([
            'data' => $clinicInvoice->fresh()->load([
                'clinic:id,name,clinic_code',
                'patient:id,first_name,last_name,mrn',
            ]),
            'message' => 'Payment recorded.',
        ]);
    }
}
