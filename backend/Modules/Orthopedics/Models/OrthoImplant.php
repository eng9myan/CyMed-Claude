<?php

namespace Modules\Orthopedics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class OrthoImplant extends Model
{
    use HasUuids;

    protected $table = 'ortho_implants';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'surgeon_id',
        'implant_date',
        'implant_type',
        'manufacturer',
        'product_name',
        'lot_number',
        'serial_number',
        'implant_site',
        'notes',
    ];

    protected $casts = [
        'implant_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function surgeon()
    {
        return $this->belongsTo(User::class, 'surgeon_id');
    }
}
