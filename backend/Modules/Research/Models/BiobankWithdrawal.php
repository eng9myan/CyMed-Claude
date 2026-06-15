<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BiobankWithdrawal extends Model
{
    use HasUuids;

    protected $table = 'biobank_withdrawals';

    protected $fillable = [
        'biobank_sample_id', 'clinical_trial_id', 'withdrawn_by',
        'withdrawn_at', 'volume_used_ml', 'purpose',
    ];

    protected $casts = [
        'withdrawn_at' => 'datetime',
        'volume_used_ml' => 'decimal:3',
    ];

    public function sample()
    {
        return $this->belongsTo(BiobankSample::class, 'biobank_sample_id');
    }

    public function withdrawer()
    {
        return $this->belongsTo(User::class, 'withdrawn_by');
    }
}
