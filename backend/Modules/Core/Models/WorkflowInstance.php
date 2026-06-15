<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class WorkflowInstance extends Model
{
    use HasUuids;

    protected $table = 'workflow_instances';

    protected $fillable = [
        'template_id', 'entity_type', 'entity_id', 'current_step',
        'status', 'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at'   => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function template()
    {
        return $this->belongsTo(WorkflowTemplate::class);
    }

    public function stepLogs()
    {
        return $this->hasMany(WorkflowStepLog::class, 'instance_id');
    }
}
