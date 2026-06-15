<?php

namespace Modules\Ophthalmology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class OphthalmicProcedure extends Model
{
    use HasUuids;

    protected $table = 'ophthalmic_procedures';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'surgeon_id',
        'procedure_date',
        'eye',
        'procedure_type',
        'lens_type',
        'complications',
        'postop_va',
        'notes',
    ];

    protected $casts = [
        'procedure_date' => 'date',
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
