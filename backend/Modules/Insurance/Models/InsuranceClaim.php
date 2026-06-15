<?php

namespace Modules\Insurance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InsuranceClaim extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'insurance_claims';

    protected $fillable = [
        'encounter_id', 'patient_id', 'insurer_id', 'insurance_id',
        'claim_number', 'claim_type', 'claim_date', 'service_from_date', 'service_to_date',
        'billed_amount', 'approved_amount', 'paid_amount', 'patient_responsibility', 'adjustment_amount',
        'status',
        'submitted_at', 'submission_method', 'submission_reference',
        'acknowledged_at', 'adjudicated_at', 'paid_at', 'payment_date', 'check_number',
        'denial_reason', 'denial_code', 'appeal_deadline', 'is_appealed', 'appeal_count',
        'edi_837_payload', 'edi_835_payload', 'nphies_request', 'nphies_response',
        'created_by', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'claim_date' => 'date',
            'service_from_date' => 'date',
            'service_to_date' => 'date',
            'payment_date' => 'date',
            'appeal_deadline' => 'date',
            'submitted_at' => 'datetime',
            'acknowledged_at' => 'datetime',
            'adjudicated_at' => 'datetime',
            'paid_at' => 'datetime',
            'is_appealed' => 'boolean',
            'appeal_count' => 'integer',
            'billed_amount' => 'decimal:2',
            'approved_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'patient_responsibility' => 'decimal:2',
            'adjustment_amount' => 'decimal:2',
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

    public function insurer()
    {
        return $this->belongsTo(\Modules\Patient\Models\Insurer::class);
    }

    public static function generateClaimNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('CLM-%d-%07d', $year, $seq);
    }
}
