<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserLocalePreference extends Model
{
    use HasUuids;

    protected $table = 'user_locale_preferences';

    protected $fillable = [
        'user_id', 'locale', 'date_format', 'time_format',
        'calendar_type', 'number_format',
    ];
}
