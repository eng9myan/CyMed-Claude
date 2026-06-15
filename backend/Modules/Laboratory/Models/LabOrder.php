<?php

namespace Modules\Laboratory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LabOrder extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id', 'encounter_id', 'ordered_by', 'department_id',
        'order_number', 'ordered_at', 'priority',
        'specimen_type', 'collection_method', 'collection_requested_at',
        'collected_at', 'collected_by', 'received_at_lab',
        'clinical_history', 'status',
    ];

    protected function casts(): array
    {
        return [
            'ordered_at' => 'datetime',
            'collection_requested_at' => 'datetime',
            'collected_at' => 'datetime',
            'received_at_lab' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'ordered_by');
    }

    public function specimens()
    {
        return $this->hasMany(LabSpecimen::class);
    }

    public function results()
    {
        return $this->hasMany(LabResult::class);
    }

    public static function generateOrderNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('LAB-%d-%07d', $year, $seq);
    }
}
