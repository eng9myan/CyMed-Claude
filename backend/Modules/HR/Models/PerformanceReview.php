<?php

namespace Modules\HR\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class PerformanceReview extends Model
{
    use HasUuids;

    protected $table = 'performance_reviews';

    protected $fillable = [
        'reviewer_id', 'reviewee_id', 'facility_id', 'review_period',
        'overall_score', 'punctuality_score', 'clinical_score', 'teamwork_score',
        'review_date', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'review_date'      => 'date',
            'overall_score'    => 'decimal:1',
            'punctuality_score' => 'decimal:1',
            'clinical_score'   => 'decimal:1',
            'teamwork_score'   => 'decimal:1',
        ];
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee()
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
