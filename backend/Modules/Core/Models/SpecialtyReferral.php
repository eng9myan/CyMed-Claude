<?php

namespace Modules\Core\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Patient;

class SpecialtyReferral extends Model
{
    use HasUuids;

    protected $table = 'specialty_referrals';

    protected $fillable = [
        'referral_number',
        'patient_id',
        'encounter_id',
        'referring_provider_id',
        'referred_to_specialty',
        'referred_to_provider_id',
        'facility_id',
        'urgency',
        'reason',
        'clinical_notes',
        'status',
        'accepted_at',
        'completed_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public static function generateReferralNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(referral_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM specialty_referrals WHERE referral_number LIKE ?",
            ["REF-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('REF-%d-%06d', $year, $seq);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function referringProvider()
    {
        return $this->belongsTo(User::class, 'referring_provider_id');
    }

    public function referredToProvider()
    {
        return $this->belongsTo(User::class, 'referred_to_provider_id');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
