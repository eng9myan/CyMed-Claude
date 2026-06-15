<?php

namespace Modules\DocumentManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;

class ClinicalDocument extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'clinical_documents';

    protected $fillable = [
        'document_number',
        'facility_id',
        'patient_id',
        'encounter_id',
        'uploaded_by',
        'document_type',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'is_signed',
        'signed_by',
        'signed_at',
        'is_confidential',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_signed' => 'boolean',
            'is_confidential' => 'boolean',
            'signed_at' => 'datetime',
        ];
    }

    public static function generateDocumentNumber(): string
    {
        $year = date('Y');
        $prefix = "DOC-{$year}-";
        $rows = DB::select(
            "SELECT MAX(CAST(SUBSTRING(document_number FROM LENGTH(?) + 1) AS INTEGER)) as max_seq FROM clinical_documents WHERE document_number LIKE ?",
            [$prefix, $prefix . '%']
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return $prefix . str_pad($seq, 6, '0', STR_PAD_LEFT);
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function signedBy()
    {
        return $this->belongsTo(User::class, 'signed_by');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
