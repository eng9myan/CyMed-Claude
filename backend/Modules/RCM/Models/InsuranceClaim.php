<?php

namespace Modules\RCM\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class InsuranceClaim extends Model
{
    use HasUuids;

    protected $table = 'rcm_claims';

    protected $fillable = [
        'facility_id', 'patient_id', 'encounter_id', 'claim_number', 'insurer_id',
        'diagnosis_codes', 'procedure_codes', 'billed_amount', 'allowed_amount',
        'paid_amount', 'status', 'submitted_at', 'adjudicated_at',
    ];

    protected function casts(): array
    {
        return [
            'diagnosis_codes'  => 'array',
            'procedure_codes'  => 'array',
            'billed_amount'    => 'decimal:2',
            'allowed_amount'   => 'decimal:2',
            'paid_amount'      => 'decimal:2',
            'submitted_at'     => 'datetime',
            'adjudicated_at'   => 'datetime',
        ];
    }

    public function lineItems()
    {
        return $this->hasMany(ClaimLineItem::class, 'claim_id');
    }
}
