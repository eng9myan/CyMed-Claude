<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TenantConfiguration extends Model
{
    use HasUuids;

    protected $table = 'tenant_configurations';

    protected $fillable = [
        'facility_id', 'primary_color', 'secondary_color', 'logo_url',
        'favicon_url', 'app_name', 'app_name_ar', 'support_email',
        'support_phone', 'enabled_modules', 'custom_fields',
    ];

    protected $casts = [
        'enabled_modules' => 'array',
        'custom_fields' => 'array',
    ];
}
