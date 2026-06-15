<?php

namespace Modules\PACS\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class DicomStudy extends Model
{
    use HasUuids;

    protected $table = 'dicom_studies';

    protected $fillable = [
        'study_instance_uid', 'patient_id', 'facility_id', 'ordered_by',
        'accession_number', 'modality', 'body_part', 'study_date', 'description',
        'series_count', 'instance_count', 'status', 'storage_path',
    ];

    protected $casts = [
        'study_date' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public function series()
    {
        return $this->hasMany(DicomSeries::class);
    }
}
