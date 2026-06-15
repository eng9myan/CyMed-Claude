<?php

namespace Modules\Billing\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Zatca\ZatcaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Billing\Models\Invoice;

class InvoiceController extends Controller
{
    public function __construct(private readonly ZatcaService $zatca) {}

    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['billing.invoices.view', 'patients.view'])) {
            abort(403);
        }

        $invoices = Invoice::with(['patient:id,first_name,last_name,mrn'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('invoice_date')
            ->paginate((int) ($request->per_page ?? 20));

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
        if (! $authUser->hasPermissionTo('billing.invoices.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:invoice_date'],
            'invoice_type' => ['nullable', 'in:standard,insurance,final,interim,credit'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'insurance_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $subtotal = $validated['subtotal'];
        $discount = $validated['discount_amount'] ?? 0;
        $tax = $validated['tax_amount'] ?? 0;
        $insurance = $validated['insurance_amount'] ?? 0;
        $total = round($subtotal - $discount + $tax, 2);
        $patientAmt = round($total - $insurance, 2);

        $validated['invoice_number'] = Invoice::generateInvoiceNumber();
        $validated['status'] = 'draft';
        $validated['invoice_type'] ??= 'standard';
        $validated['total_amount'] = $total;
        $validated['patient_amount'] = $patientAmt;
        $validated['balance'] = $patientAmt;
        $validated['paid_amount'] = 0;
        $validated['currency'] = 'SAR';
        $validated['created_by'] = $authUser->id;

        $invoice = Invoice::create($validated);

        return response()->json([
            'data' => $invoice->load('patient:id,first_name,last_name,mrn'),
            'message' => 'Invoice created.',
        ], 201);
    }

    public function show(Request $request, Invoice $invoice): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['billing.invoices.view', 'patients.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $invoice->load(['patient', 'payments']),
        ]);
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('billing.invoices.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:draft,issued,partially_paid,paid,cancelled,written_off'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $invoice->update($validated);

        return response()->json(['data' => $invoice->fresh()]);
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('billing.invoices.create')) {
            abort(403);
        }

        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Only draft invoices can be deleted.'], 422);
        }

        $invoice->delete();

        return response()->json(null, 204);
    }

    /**
     * Generate ZATCA e-invoice fields (UUID, QR code, hash) for a finalized invoice.
     */
    public function zatcaGenerate(Request $request, Invoice $invoice): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('billing.invoices.create')) {
            abort(403);
        }

        if (in_array($invoice->status, ['draft'])) {
            return response()->json(['message' => 'Invoice must be issued before generating ZATCA fields.'], 422);
        }

        $fields = $this->zatca->generateInvoiceFields([
            'invoice_number' => $invoice->invoice_number,
            'invoice_date'   => $invoice->invoice_date->toDateString(),
            'seller_name'    => config('services.zatca.seller_name'),
            'seller_vat'     => config('services.zatca.seller_vat', ''),
            'buyer_name'     => $invoice->patient?->full_name ?? '',
            'subtotal'       => (float) $invoice->subtotal,
            'vat_amount'     => (float) $invoice->tax_amount,
            'total'          => (float) $invoice->total_amount,
            'currency'       => $invoice->currency ?? 'SAR',
            'invoice_type'   => $invoice->invoice_type ?? 'standard',
            'line_items'     => [],
        ]);

        $invoice->update([
            'zatca_uuid'     => $fields['zatca_uuid'],
            'zatca_hash'     => $fields['zatca_xml_hash'],
            'zatca_qr_code'  => $fields['zatca_qr_code'],
        ]);

        return response()->json([
            'data'    => array_merge($fields, ['invoice_id' => $invoice->id]),
            'message' => 'ZATCA fields generated.',
        ]);
    }

    /**
     * Return ZATCA-compliant UBL 2.1 XML for the invoice.
     */
    public function zatcaXml(Request $request, Invoice $invoice): \Illuminate\Http\Response
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('billing.invoices.view')) {
            abort(403);
        }

        if (! $invoice->zatca_uuid) {
            abort(422, 'ZATCA fields not yet generated for this invoice. Call POST zatca first.');
        }

        $zatca = [
            'zatca_uuid'     => $invoice->zatca_uuid,
            'zatca_xml_hash' => $invoice->zatca_hash,
            'zatca_qr_code'  => $invoice->zatca_qr_code,
        ];

        $xml = $this->zatca->buildXml([
            'invoice_number' => $invoice->invoice_number,
            'invoice_date'   => $invoice->invoice_date->toDateString(),
            'seller_name'    => config('services.zatca.seller_name'),
            'seller_vat'     => config('services.zatca.seller_vat', ''),
            'buyer_name'     => $invoice->patient?->full_name ?? '',
            'subtotal'       => (float) $invoice->subtotal,
            'vat_amount'     => (float) $invoice->tax_amount,
            'total'          => (float) $invoice->total_amount,
            'currency'       => $invoice->currency ?? 'SAR',
            'invoice_type'   => $invoice->invoice_type ?? 'standard',
            'line_items'     => [],
        ], $zatca);

        return response($xml, 200, [
            'Content-Type'        => 'application/xml; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"invoice-{$invoice->invoice_number}.xml\"",
        ]);
    }
}
