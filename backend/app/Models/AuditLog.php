<?php

namespace App\Models;

use Spatie\Activitylog\Models\Activity;

class AuditLog extends Activity
{
    protected $table = 'activity_log';

    public function scopeForPatient($query, string $patientId)
    {
        return $query->where(function ($q) use ($patientId) {
            $q->where('subject_type', 'Modules\Patient\Models\Patient')
              ->where('subject_id', $patientId);
        });
    }

    public function scopeForEncounter($query, string $encounterId)
    {
        return $query->where('properties->encounter_id', $encounterId);
    }

    public function scopePhiAccess($query)
    {
        return $query->whereIn('event', ['viewed', 'exported', 'printed']);
    }
}
