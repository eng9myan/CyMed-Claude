<?php

namespace Modules\Core\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class WorkflowStepLog extends Model
{
    use HasUuids;

    protected $table = 'workflow_step_logs';

    protected $fillable = [
        'instance_id', 'step_name', 'action_taken',
        'completed_by', 'completed_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function instance()
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    public function completedByUser()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
