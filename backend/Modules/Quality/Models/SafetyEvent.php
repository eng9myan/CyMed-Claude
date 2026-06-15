<?php

namespace Modules\Quality\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class SafetyEvent extends Model
{
    use HasUuids;

    protected $table = 'safety_events';

    protected $fillable = [
        'event_number', 'facility_id', 'patient_id', 'reported_by',
        'event_type', 'severity', 'description', 'event_occurred_at',
        'location', 'status',
    ];

    protected function casts(): array
    {
        return [
            'event_occurred_at' => 'datetime',
        ];
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function rootCauseAnalyses()
    {
        return $this->hasMany(RootCauseAnalysis::class, 'event_id');
    }
}
