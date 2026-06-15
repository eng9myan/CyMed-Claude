<?php

namespace Modules\DataWarehouse\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LabFact extends Model
{
    use HasUuids;

    protected $table = 'lab_facts';

    protected $fillable = [
        'facility_id', 'patient_id', 'order_date',
        'test_category', 'turnaround_hours', 'is_abnormal',
    ];

    protected function casts(): array
    {
        return [
            'order_date'        => 'date',
            'turnaround_hours'  => 'decimal:1',
            'is_abnormal'       => 'boolean',
        ];
    }
}
