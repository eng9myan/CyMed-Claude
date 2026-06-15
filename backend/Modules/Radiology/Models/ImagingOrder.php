<?php

namespace Modules\Radiology\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ImagingOrder extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id', 'encounter_id', 'ordered_by',
        'order_number', 'accession_number', 'ordered_at', 'priority',
        'modality', 'body_part', 'laterality', 'procedure_code', 'procedure_name',
        'clinical_indication', 'contrast_required', 'contrast_agent',
        'contrast_allergy_checked', 'pregnancy_status', 'special_instructions',
        'scheduled_at', 'modality_room_id', 'started_at', 'completed_at',
        'performed_by', 'radiologist_id',
        'worklist_status', 'report_status',
        'findings', 'impression', 'recommendation', 'report_signed_at',
        'dicom_study_uid', 'dicom_series_count', 'dicom_image_count', 'pacs_url',
    ];

    protected function casts(): array
    {
        return [
            'ordered_at' => 'datetime',
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'report_signed_at' => 'datetime',
            'contrast_required' => 'boolean',
            'contrast_allergy_checked' => 'boolean',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'ordered_by');
    }

    public function radiologist()
    {
        return $this->belongsTo(\App\Models\User::class, 'radiologist_id');
    }

    public static function generateOrderNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('RAD-%d-%07d', $year, $seq);
    }
}
