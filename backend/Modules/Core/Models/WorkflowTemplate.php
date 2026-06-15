<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class WorkflowTemplate extends Model
{
    use HasUuids;

    protected $table = 'workflow_templates';

    protected $fillable = [
        'facility_id', 'template_code', 'name', 'trigger_event', 'steps', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'steps'     => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function instances()
    {
        return $this->hasMany(WorkflowInstance::class, 'template_id');
    }
}
