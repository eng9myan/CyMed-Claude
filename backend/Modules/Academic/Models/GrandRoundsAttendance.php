<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GrandRoundsAttendance extends Model
{
    use HasUuids;

    protected $table = 'grand_rounds_attendance';

    protected $fillable = [
        'grand_rounds_id',
        'user_id',
        'attended_at',
        'cme_completion_id',
    ];

    protected $casts = [
        'attended_at' => 'datetime',
    ];

    public function grandRound()
    {
        return $this->belongsTo(GrandRound::class, 'grand_rounds_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cmeCompletion()
    {
        return $this->belongsTo(CmeCompletion::class, 'cme_completion_id');
    }
}
