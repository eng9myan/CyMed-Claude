<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CmeCompletion extends Model
{
    use HasUuids;

    protected $table = 'cme_completions';

    protected $fillable = [
        'activity_id',
        'user_id',
        'completed_at',
        'certificate_number',
        'credits_earned',
        'verified_by',
    ];

    protected $casts = [
        'completed_at' => 'date',
        'credits_earned' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activity()
    {
        return $this->belongsTo(CmeActivity::class, 'activity_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
