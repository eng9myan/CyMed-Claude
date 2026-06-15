<?php

namespace Modules\Laboratory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LabSpecimen extends Model
{
    use HasUuids;

    protected $fillable = [
        'lab_order_id', 'accession_number', 'specimen_type', 'container_type',
        'specimen_source', 'collected_at', 'volume_ml',
        'status', 'rejection_reason', 'storage_location', 'received_at',
    ];

    protected function casts(): array
    {
        return [
            'collected_at' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    public function labOrder()
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function results()
    {
        return $this->hasMany(LabResult::class, 'specimen_id');
    }
}
