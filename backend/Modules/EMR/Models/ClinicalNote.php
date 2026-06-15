<?php

namespace Modules\EMR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClinicalNote extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id', 'encounter_id', 'template_id',
        'note_type', 'specialty', 'note_title',
        'content', 'content_text',
        'status', 'is_addendum', 'addendum_to',
        'authored_by', 'authored_at',
        'signed_by', 'signed_at',
        'cosigned_by', 'cosigned_at', 'cosign_required_reason',
        'amendment_history', 'ai_assisted',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'amendment_history' => 'array',
            'authored_at' => 'datetime',
            'signed_at' => 'datetime',
            'cosigned_at' => 'datetime',
            'is_addendum' => 'boolean',
            'ai_assisted' => 'boolean',
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

    public function author()
    {
        return $this->belongsTo(\App\Models\User::class, 'authored_by');
    }

    public function signedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'signed_by');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSigned($query)
    {
        return $query->where('status', 'signed');
    }
}
