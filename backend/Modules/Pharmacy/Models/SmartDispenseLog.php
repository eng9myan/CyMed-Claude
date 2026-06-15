<?php

namespace Modules\Pharmacy\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SmartDispenseLog extends Model
{
    use HasUuids;

    protected $table = 'smart_dispense_logs';

    protected $fillable = [
        'facility_id', 'patient_id', 'nurse_id', 'cabinet_id', 'pocket_id',
        'drug_name', 'lot_number', 'expiry_date', 'quantity_dispensed',
        'unit', 'dispense_reason', 'is_overridden', 'override_reason', 'dispensed_at',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'dispensed_at' => 'datetime',
        'is_overridden' => 'boolean',
        'quantity_dispensed' => 'float',
    ];
}
