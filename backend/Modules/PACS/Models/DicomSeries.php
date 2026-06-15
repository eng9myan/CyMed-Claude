<?php

namespace Modules\PACS\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DicomSeries extends Model
{
    use HasUuids;

    protected $table = 'dicom_series';

    protected $fillable = [
        'dicom_study_id', 'series_instance_uid', 'series_number',
        'series_description', 'modality', 'instance_count', 'body_part',
    ];

    public function study()
    {
        return $this->belongsTo(DicomStudy::class, 'dicom_study_id');
    }
}
