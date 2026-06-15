<?php

namespace Modules\RCM\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ClaimLineItem extends Model
{
    use HasUuids;

    protected $table = 'claim_line_items';

    protected $fillable = [
        'claim_id', 'cpt_code', 'description', 'billed_units',
        'billed_amount', 'allowed_amount', 'status',
    ];

    protected function casts(): array
    {
        return [
            'billed_amount'  => 'decimal:2',
            'allowed_amount' => 'decimal:2',
            'billed_units'   => 'decimal:2',
        ];
    }

    public function claim()
    {
        return $this->belongsTo(InsuranceClaim::class, 'claim_id');
    }
}
