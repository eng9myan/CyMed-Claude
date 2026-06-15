<?php

namespace Modules\Billing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoice extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'encounter_id', 'patient_id',
        'invoice_number', 'invoice_date', 'due_date', 'invoice_type', 'status',
        'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
        'insurance_amount', 'patient_amount', 'paid_amount', 'balance',
        'currency', 'created_by',
        'zatca_uuid', 'zatca_hash', 'zatca_qr_code', 'zatca_submitted', 'zatca_submitted_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
            'due_date' => 'date',
            'zatca_submitted_at' => 'datetime',
            'zatca_submitted' => 'boolean',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'insurance_amount' => 'decimal:2',
            'patient_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'balance' => 'decimal:2',
        ];
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public static function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('INV-%d-%07d', $year, $seq);
    }
}
