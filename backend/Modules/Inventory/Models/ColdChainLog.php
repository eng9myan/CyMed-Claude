<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ColdChainLog extends Model
{
    use HasUuids;

    protected $table = 'cold_chain_logs';

    protected $fillable = [
        'inventory_item_id', 'temperature_celsius', 'humidity_percent',
        'location', 'logged_at', 'logger_device_id', 'is_alert',
    ];

    protected function casts(): array
    {
        return [
            'temperature_celsius' => 'decimal:2',
            'humidity_percent'    => 'decimal:2',
            'logged_at'           => 'datetime',
            'is_alert'            => 'boolean',
        ];
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
