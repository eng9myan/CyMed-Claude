<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DeploymentNote extends Model
{
    use HasUuids;

    protected $table = 'deployment_notes';

    protected $fillable = [
        'version', 'environment', 'release_notes', 'migrations_run',
        'features_deployed', 'deployed_by', 'deployed_at',
    ];

    protected $casts = [
        'migrations_run' => 'array',
        'features_deployed' => 'array',
        'deployed_at' => 'datetime',
    ];
}
