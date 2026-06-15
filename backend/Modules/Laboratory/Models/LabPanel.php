<?php

namespace Modules\Laboratory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LabPanel extends Model
{
    use HasUuids;

    protected $fillable = [
        'panel_code', 'panel_name', 'panel_category', 'specimen_type',
        'tat_minutes', 'price', 'is_active', 'tests',
    ];

    protected function casts(): array
    {
        return [
            'tests' => 'array',
            'is_active' => 'boolean',
            'price' => 'decimal:2',
            'tat_minutes' => 'integer',
        ];
    }
}
