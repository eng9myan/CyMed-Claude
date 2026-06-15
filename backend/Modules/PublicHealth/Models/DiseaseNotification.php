<?php

namespace Modules\PublicHealth\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DiseaseNotification extends Model
{
    use HasUuids;

    protected $table = 'disease_notifications';

    protected $fillable = [
        'facility_id', 'patient_id', 'disease_id', 'onset_date',
        'reported_by', 'reported_at', 'public_health_ref', 'status',
    ];

    protected function casts(): array
    {
        return [
            'onset_date'  => 'date',
            'reported_at' => 'datetime',
        ];
    }

    public function disease()
    {
        return $this->belongsTo(ReportableDisease::class, 'disease_id');
    }
}
