<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LocaleTranslation extends Model
{
    use HasUuids;

    protected $table = 'locale_translations';

    protected $fillable = [
        'locale', 'namespace', 'key', 'value', 'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];
}
