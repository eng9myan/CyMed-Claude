<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FeatureFlag extends Model
{
    use HasUuids;

    protected $table = 'feature_flags';

    protected $fillable = [
        'flag_name', 'description', 'is_global', 'default_value',
    ];

    protected $casts = [
        'is_global' => 'boolean',
        'default_value' => 'boolean',
    ];
}
