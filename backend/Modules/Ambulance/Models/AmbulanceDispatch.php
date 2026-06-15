<?php

namespace Modules\Ambulance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class AmbulanceDispatch extends Model
{
    use HasUuids;

    protected $table = 'ambulance_dispatches';

    protected $fillable = [
        'ambulance_id', 'patient_id', 'incident_number', 'incident_type', 'priority',
        'pickup_address', 'destination_facility_id', 'destination_address',
        'dispatch_at', 'en_route_at', 'on_scene_at', 'departed_scene_at', 'arrived_at', 'closed_at',
        'status', 'dispatch_notes', 'outcome', 'dispatched_by',
    ];

    protected $casts = [
        'dispatch_at' => 'datetime',
        'en_route_at' => 'datetime',
        'on_scene_at' => 'datetime',
        'departed_scene_at' => 'datetime',
        'arrived_at' => 'datetime',
        'closed_at' => 'datetime',
        'priority' => 'integer',
    ];

    public static function generateIncidentNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('AMB-%d-%06d', $year, $seq);
    }

    public function ambulance()
    {
        return $this->belongsTo(Ambulance::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function destinationFacility()
    {
        return $this->belongsTo(Facility::class, 'destination_facility_id');
    }

    public function dispatchedBy()
    {
        return $this->belongsTo(User::class, 'dispatched_by');
    }
}
