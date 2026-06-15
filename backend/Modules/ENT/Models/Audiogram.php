<?php

namespace Modules\ENT\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class Audiogram extends Model
{
    use HasUuids;

    protected $table = 'audiograms';

    protected $fillable = [
        'patient_id',
        'performed_by',
        'performed_at',
        'test_type',
        'right_frequencies',
        'left_frequencies',
        'speech_reception_right',
        'speech_reception_left',
        'tympanogram_type_right',
        'tympanogram_type_left',
        'interpretation',
    ];

    protected $casts = [
        'performed_at' => 'date',
        'right_frequencies' => 'array',
        'left_frequencies' => 'array',
        'speech_reception_right' => 'decimal:1',
        'speech_reception_left' => 'decimal:1',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
