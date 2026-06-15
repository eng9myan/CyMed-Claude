<?php

namespace Modules\BloodBank\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Patient;

class BloodDonor extends Model
{
    use HasUuids;

    protected $table = 'blood_donors';

    protected $fillable = [
        'donor_number',
        'patient_id',
        'first_name',
        'last_name',
        'blood_group',
        'rh_factor',
        'phone',
        'email',
        'date_of_birth',
        'last_donation_at',
        'total_donations',
        'is_active',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'last_donation_at' => 'datetime',
        'total_donations' => 'integer',
        'is_active' => 'boolean',
    ];

    public static function generateDonorNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(donor_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM blood_donors WHERE donor_number LIKE ?",
            ["DON-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('DON-%d-%06d', $year, $seq);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function bloodUnits()
    {
        return $this->hasMany(BloodUnit::class, 'donor_id');
    }
}
