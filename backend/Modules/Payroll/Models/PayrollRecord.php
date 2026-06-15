<?php

namespace Modules\Payroll\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayrollRecord extends Model
{
    use HasUuids;

    protected $table = 'payroll_records';

    protected $fillable = [
        'user_id', 'facility_id', 'pay_period_start', 'pay_period_end',
        'basic_salary', 'overtime_hours', 'overtime_pay',
        'allowances', 'deductions', 'total_allowances', 'total_deductions',
        'gross_pay', 'tax_amount', 'net_pay',
        'status', 'currency', 'created_by',
        'approved_by', 'approved_at', 'paid_at', 'payment_reference',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'basic_salary' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'total_allowances' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'allowances' => 'array',
        'deductions' => 'array',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
