<?php

namespace Modules\Quality\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class IncidentReport extends Model
{
    use HasUuids;

    protected $table = 'incident_reports';

    protected $fillable = [
        'facility_id', 'patient_id', 'encounter_id',
        'report_number', 'incident_at', 'incident_type', 'incident_category',
        'severity', 'location', 'description', 'immediate_action',
        'patient_notified', 'physician_notified', 'management_notified',
        'external_reporting_required', 'status',
        'reported_by', 'assigned_to', 'closed_by', 'closed_at',
        'root_cause', 'corrective_actions', 'rca_data',
    ];

    protected $casts = [
        'incident_at' => 'datetime',
        'closed_at' => 'datetime',
        'patient_notified' => 'boolean',
        'physician_notified' => 'boolean',
        'management_notified' => 'boolean',
        'external_reporting_required' => 'boolean',
        'rca_data' => 'array',
    ];

    public static function generateReportNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('INC-%d-%05d', $year, $seq);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function reportedBy()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }
}
