<?php

namespace Modules\Dental\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class DentalChart extends Model
{
    use HasUuids;

    protected $table = 'dental_charts';

    protected $fillable = [
        'patient_id',
        'created_by',
        'teeth_status',
    ];

    protected $casts = [
        'teeth_status' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
