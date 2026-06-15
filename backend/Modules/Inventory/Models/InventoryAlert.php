<?php

namespace Modules\Inventory\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class InventoryAlert extends Model
{
    use HasUuids;

    protected $table = 'inventory_alerts';

    protected $fillable = [
        'inventory_item_id', 'alert_type', 'severity', 'message',
        'is_resolved', 'resolved_at', 'resolved_by', 'triggered_at',
    ];

    protected function casts(): array
    {
        return [
            'is_resolved'  => 'boolean',
            'resolved_at'  => 'datetime',
            'triggered_at' => 'datetime',
        ];
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function resolvedByUser()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
