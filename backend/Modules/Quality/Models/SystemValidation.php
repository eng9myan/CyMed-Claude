<?php

namespace Modules\Quality\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SystemValidation extends Model
{
    use HasUuids;

    protected $table = 'system_validations';

    protected $fillable = [
        'facility_id', 'validation_type', 'component', 'status',
        'test_script', 'results', 'defects', 'validated_by', 'validated_at',
    ];

    protected $casts = [
        'validated_at' => 'datetime',
    ];
}
