<?php

namespace Modules\Dermatology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class SkinLesion extends Model
{
    use HasUuids;

    protected $table = 'skin_lesions';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'documented_by',
        'documented_at',
        'lesion_number',
        'body_location',
        'lesion_type',
        'size_mm',
        'color',
        'border',
        'surface',
        'distribution',
        'associated_symptoms',
        'clinical_diagnosis',
        'biopsy_taken',
        'biopsy_result',
    ];

    protected $casts = [
        'documented_at' => 'date',
        'biopsy_taken' => 'boolean',
        'size_mm' => 'float',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function documentedBy()
    {
        return $this->belongsTo(User::class, 'documented_by');
    }
}
