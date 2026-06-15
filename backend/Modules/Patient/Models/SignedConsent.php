<?php

namespace Modules\Patient\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SignedConsent extends Model
{
    use HasUuids;

    protected $table = 'signed_consents';

    protected $fillable = [
        'patient_id', 'form_id', 'encounter_id', 'signed_by',
        'witness_id', 'signature_data', 'signed_at',
        'is_withdrawn', 'withdrawn_at',
    ];

    protected function casts(): array
    {
        return [
            'signed_at'    => 'datetime',
            'withdrawn_at' => 'datetime',
            'is_withdrawn' => 'boolean',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function form()
    {
        return $this->belongsTo(ConsentForm::class);
    }

    public function signedByUser()
    {
        return $this->belongsTo(User::class, 'signed_by');
    }

    public function witness()
    {
        return $this->belongsTo(User::class, 'witness_id');
    }
}
