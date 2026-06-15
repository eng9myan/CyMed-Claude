<?php

namespace Modules\Quality\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RootCauseAnalysis extends Model
{
    use HasUuids;

    protected $table = 'root_cause_analyses';

    protected $fillable = [
        'event_id', 'rca_type', 'contributing_factors', 'corrective_actions',
        'conducted_by', 'completed_at', 'status',
    ];

    protected function casts(): array
    {
        return [
            'contributing_factors' => 'array',
            'corrective_actions'   => 'array',
            'completed_at'         => 'datetime',
        ];
    }

    public function safetyEvent()
    {
        return $this->belongsTo(SafetyEvent::class, 'event_id');
    }

    public function conductor()
    {
        return $this->belongsTo(User::class, 'conducted_by');
    }
}
