<?php

namespace Modules\PatientEngagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class HealthEducationContent extends Model
{
    use HasUuids;

    protected $table = 'health_education_content';

    protected $fillable = [
        'title',
        'title_ar',
        'content_type',
        'category',
        'content',
        'language',
        'is_published',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
