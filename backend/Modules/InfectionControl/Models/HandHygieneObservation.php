<?php

namespace Modules\InfectionControl\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class HandHygieneObservation extends Model
{
    use HasUuids;

    protected $table = 'hand_hygiene_observations';

    protected $fillable = [
        'facility_id', 'unit', 'observed_role', 'total_opportunities',
        'compliant_actions', 'observation_date', 'observer_id',
    ];

    protected $casts = [
        'observation_date' => 'date',
    ];
}
