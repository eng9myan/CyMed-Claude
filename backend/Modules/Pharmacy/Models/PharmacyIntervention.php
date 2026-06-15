<?php

namespace Modules\Pharmacy\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PharmacyIntervention extends Model
{
    use HasUuids;

    protected $table = 'pharmacy_interventions';

    protected $fillable = [
        'pharmacist_id', 'patient_id', 'medication_order_id', 'intervention_type',
        'clinical_issue', 'recommendation', 'outcome', 'prescriber_id', 'intervened_at',
    ];

    protected $casts = [
        'intervened_at' => 'datetime',
    ];
}
