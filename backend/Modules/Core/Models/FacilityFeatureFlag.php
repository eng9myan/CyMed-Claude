<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FacilityFeatureFlag extends Model
{
    use HasUuids;

    protected $table = 'facility_feature_flags';

    protected $fillable = [
        'facility_id', 'feature_flag_id', 'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];
}
