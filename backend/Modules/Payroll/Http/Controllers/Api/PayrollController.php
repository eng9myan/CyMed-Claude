<?php

namespace Modules\Payroll\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\Facility;
use Modules\Payroll\Models\PayrollRecord;

class PayrollController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['payroll.view', 'payroll.process'])) {
            abort(403);
        }

        $records = PayrollRecord::with(['employee:id,first_name,last_name,employee_id'])
            ->when($request->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->period, fn ($q, $v) => $q->where('pay_period_start', '>=', $v))
            ->orderByDesc('pay_period_end')
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
        if (! $authUser->hasPermissionTo('payroll.process')) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
            'pay_period_start' => ['required', 'date'],
            'pay_period_end' => ['required', 'date', 'after:pay_period_start'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'overtime_hours' => ['nullable', 'numeric', 'min:0'],
            'overtime_pay' => ['nullable', 'numeric', 'min:0'],
            'allowances' => ['nullable', 'array'],
            'allowances.*.type' => ['required_with:allowances', 'string'],
            'allowances.*.amount' => ['required_with:allowances', 'numeric', 'min:0'],
            'deductions' => ['nullable', 'array'],
            'deductions.*.type' => ['required_with:deductions', 'string'],
            'deductions.*.amount' => ['required_with:deductions', 'numeric', 'min:0'],
        ]);

        $facility = isset($validated['facility_id'])
            ? Facility::select('income_tax_rate')->find($validated['facility_id'])
            : null;
        $incomeTaxRate = (float) ($facility->income_tax_rate ?? 0);

        $totalAllowances = collect($validated['allowances'] ?? [])->sum('amount');
        $totalDeductions = collect($validated['deductions'] ?? [])->sum('amount');
        $overtimePay = $validated['overtime_pay'] ?? 0;
        $grossPay = $validated['basic_salary'] + $overtimePay + $totalAllowances;
        $taxAmount = round($grossPay * $incomeTaxRate / 100, 2);
        $netPay = $grossPay - $totalDeductions - $taxAmount;

        $validated['total_allowances'] = $totalAllowances;
        $validated['total_deductions'] = $totalDeductions;
        $validated['gross_pay'] = $grossPay;
        $validated['tax_amount'] = $taxAmount;
        $validated['net_pay'] = $netPay;
        $validated['status'] = 'draft';
        $validated['created_by'] = $authUser->id;

        $record = PayrollRecord::create($validated);

        return response()->json([
            'data' => $record->load(['employee:id,first_name,last_name']),
            'message' => 'Payroll record created.',
        ], 201);
    }

    public function show(Request $request, PayrollRecord $payroll): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['payroll.view', 'payroll.process'])) {
            abort(403);
        }

        return response()->json([
            'data' => $payroll->load(['employee:id,first_name,last_name', 'approvedBy:id,first_name,last_name']),
        ]);
    }

    public function approve(Request $request, PayrollRecord $payroll): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('payroll.process')) {
            abort(403);
        }

        if ($payroll->status !== 'draft') {
            return response()->json(['message' => 'Only draft payroll can be approved.'], 422);
        }

        $payroll->update([
            'status' => 'approved',
            'approved_by' => $authUser->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'data' => $payroll->fresh(),
            'message' => 'Payroll approved.',
        ]);
    }

    public function pay(Request $request, PayrollRecord $payroll): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('payroll.process')) {
            abort(403);
        }

        if ($payroll->status !== 'approved') {
            return response()->json(['message' => 'Only approved payroll can be paid.'], 422);
        }

        $validated = $request->validate([
            'payment_reference' => ['required', 'string', 'max:50'],
        ]);

        $payroll->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_reference' => $validated['payment_reference'],
        ]);

        return response()->json([
            'data' => $payroll->fresh(),
            'message' => 'Payment processed.',
        ]);
    }
}
