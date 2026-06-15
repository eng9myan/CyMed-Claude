<?php

namespace Modules\LabAnalyzer\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PoctResult extends Model
{
    use HasUuids;

    protected $table = 'poct_results';

    protected $fillable = [
        'lab_analyzer_id', 'patient_id', 'ordered_by', 'test_name', 'test_code',
        'result_value', 'unit', 'reference_range', 'interpretation',
        'is_critical', 'critical_acknowledged', 'acknowledged_by', 'result_at',
    ];

    protected $casts = [
        'is_critical' => 'boolean',
        'critical_acknowledged' => 'boolean',
        'result_at' => 'datetime',
    ];

    public function analyzer()
    {
        return $this->belongsTo(LabAnalyzer::class, 'lab_analyzer_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
