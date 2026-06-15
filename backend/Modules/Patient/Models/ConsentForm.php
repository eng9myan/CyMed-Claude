<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class ConsentForm extends Model
{
    use HasUuids;

    protected $table = 'consent_forms';

    protected $fillable = [
        'facility_id', 'form_code', 'title', 'content',
        'version', 'language', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function signedConsents()
    {
        return $this->hasMany(SignedConsent::class, 'form_id');
    }
}
