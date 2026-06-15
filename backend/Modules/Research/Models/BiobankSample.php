<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class BiobankSample extends Model
{
    use HasUuids;

    protected $table = 'biobank_samples';

    protected $fillable = [
        'barcode', 'patient_id', 'facility_id', 'sample_type', 'collection_method',
        'collected_at', 'collected_by', 'volume_ml', 'storage_location',
        'storage_temperature', 'status', 'expiry_date', 'metadata',
    ];

    protected $casts = [
        'collected_at' => 'datetime',
        'expiry_date' => 'date',
        'volume_ml' => 'decimal:3',
        'storage_temperature' => 'decimal:1',
        'metadata' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function withdrawals()
    {
        return $this->hasMany(BiobankWithdrawal::class);
    }
}
