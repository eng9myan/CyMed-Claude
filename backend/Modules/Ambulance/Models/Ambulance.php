<?php

namespace Modules\Ambulance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class Ambulance extends Model
{
    use HasUuids;

    protected $fillable = [
        'facility_id', 'vehicle_number', 'vehicle_type', 'status',
        'crew_ids', 'equipment', 'current_location', 'is_active',
    ];

    protected $casts = [
        'crew_ids' => 'array',
        'equipment' => 'array',
        'is_active' => 'boolean',
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function dispatches()
    {
        return $this->hasMany(AmbulanceDispatch::class);
    }
}
