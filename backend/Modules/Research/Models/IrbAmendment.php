<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class IrbAmendment extends Model
{
    use HasUuids;

    protected $table = 'irb_amendments';

    protected $fillable = [
        'irb_submission_id', 'amendment_number', 'amendment_date',
        'description', 'status', 'submitted_by',
    ];

    protected $casts = [
        'amendment_date' => 'date',
    ];

    public function submission()
    {
        return $this->belongsTo(IrbSubmission::class, 'irb_submission_id');
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
