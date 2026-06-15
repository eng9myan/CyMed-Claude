<?php

namespace Modules\Billing\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Billing\Models\Invoice;
use Modules\Billing\Models\Payment;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['billing.payments.collect', 'billing.invoices.view'])) {
            abort(403);
        }

        $payments = Payment::with(['patient:id,first_name,last_name,mrn', 'receivedBy:id,first_name,last_name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->invoice_id, fn ($q, $v) => $q->where('invoice_id', $v))
            ->orderByDesc('payment_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'total' => $payments->total(),
                'per_page' => $payments->perPage(),
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('billing.payments.collect')) {
            abort(403);
        }

        $validated = $request->validate([
            'invoice_id' => ['required', 'uuid', 'exists:invoices,id'],
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,card,bank_transfer,insurance,charity,write_off'],
            'reference_number' => ['nullable', 'string', 'max:50'],
            'transaction_id' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);

        $validated['patient_id'] = $invoice->patient_id;
        $validated['payment_number'] = Payment::generatePaymentNumber();
        $validated['status'] = 'completed';
        $validated['currency'] = 'SAR';
        $validated['received_by'] = $authUser->id;

        $payment = Payment::create($validated);

        // Update invoice paid_amount and balance
        $newPaid = round($invoice->paid_amount + $validated['amount'], 2);
        $newBalance = round($invoice->patient_amount - $newPaid, 2);
        $status = $newBalance <= 0 ? 'paid' : 'partially_paid';
        $invoice->update([
            'paid_amount' => $newPaid,
            'balance' => max(0, $newBalance),
            'status' => $status,
        ]);

        return response()->json([
            'data' => $payment->load('receivedBy:id,first_name,last_name'),
            'message' => 'Payment recorded.',
        ], 201);
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['billing.payments.collect', 'billing.invoices.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $payment->load(['invoice', 'patient', 'receivedBy:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        abort(405);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        abort(405);
    }
}
