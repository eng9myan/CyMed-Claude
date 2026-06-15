<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PromsInstrument extends Model
{
    use HasUuids;

    protected $table = 'proms_instruments';

    protected $fillable = [
        'instrument_code', 'name', 'domain', 'max_score',
        'scoring_formula', 'applicable_specialties', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'applicable_specialties' => 'array',
            'is_active'              => 'boolean',
        ];
    }

    public function scores()
    {
        return $this->hasMany(PromsScore::class, 'instrument_id');
    }
}
