<?php

namespace Modules\Quality\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GoliveChecklist extends Model
{
    use HasUuids;

    protected $table = 'golive_checklists';

    protected $fillable = [
        'facility_id', 'checklist_name', 'phase', 'items',
        'total_items', 'completed_items', 'completion_percentage',
        'status', 'target_date', 'owner_id',
    ];

    protected $casts = [
        'items' => 'array',
        'target_date' => 'date',
        'completion_percentage' => 'float',
    ];
}
