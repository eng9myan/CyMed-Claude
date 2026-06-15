<?php

namespace Modules\HR\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class StaffKpi extends Model
{
    use HasUuids;

    protected $table = 'staff_kpis';

    protected $fillable = [
        'user_id', 'facility_id', 'kpi_month', 'patients_seen',
        'procedures_done', 'on_time_rate', 'patient_satisfaction', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'on_time_rate'         => 'decimal:2',
            'patient_satisfaction' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
