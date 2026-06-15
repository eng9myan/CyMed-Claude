<?php

namespace Modules\AssetManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;

class CssdCycle extends Model
{
    use HasUuids;

    protected $table = 'cssd_cycles';

    protected $fillable = [
        'cycle_number',
        'facility_id',
        'performed_by',
        'sterilization_method',
        'load_number',
        'items_count',
        'started_at',
        'completed_at',
        'status',
        'biological_indicator',
        'bi_result',
        'operator_notes',
    ];

    protected function casts(): array
    {
        return [
            'biological_indicator' => 'boolean',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public static function generateCycleNumber(): string
    {
        $year = date('Y');
        $prefix = "CSSD-{$year}-";
        $rows = DB::select(
            "SELECT MAX(CAST(SUBSTRING(cycle_number FROM LENGTH(?) + 1) AS INTEGER)) as max_seq FROM cssd_cycles WHERE cycle_number LIKE ?",
            [$prefix, $prefix . '%']
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return $prefix . str_pad($seq, 6, '0', STR_PAD_LEFT);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
