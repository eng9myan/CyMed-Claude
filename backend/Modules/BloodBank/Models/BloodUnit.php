<?php

namespace Modules\BloodBank\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;

class BloodUnit extends Model
{
    use HasUuids;

    protected $table = 'blood_units';

    protected $fillable = [
        'unit_number',
        'donor_id',
        'facility_id',
        'blood_group',
        'rh_factor',
        'component_type',
        'volume_ml',
        'collected_at',
        'expiry_at',
        'status',
        'storage_location',
    ];

    protected $casts = [
        'collected_at' => 'datetime',
        'expiry_at' => 'datetime',
        'volume_ml' => 'integer',
    ];

    public static function generateUnitNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(unit_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM blood_units WHERE unit_number LIKE ?",
            ["BU-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('BU-%d-%06d', $year, $seq);
    }

    public function donor()
    {
        return $this->belongsTo(BloodDonor::class, 'donor_id');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function crossmatches()
    {
        return $this->hasMany(BloodCrossmatch::class, 'blood_unit_id');
    }

    public function transfusions()
    {
        return $this->hasMany(BloodTransfusion::class, 'blood_unit_id');
    }
}
