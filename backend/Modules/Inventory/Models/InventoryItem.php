<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class InventoryItem extends Model
{
    use HasUuids;

    protected $table = 'inventory_items';

    protected $fillable = [
        'facility_id', 'item_code', 'item_name', 'category', 'unit',
        'quantity_on_hand', 'reorder_level', 'max_stock_level', 'unit_cost',
        'location', 'expiry_date', 'is_active',
    ];

    protected $casts = [
        'quantity_on_hand' => 'decimal:2',
        'reorder_level' => 'decimal:2',
        'max_stock_level' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function isLowStock(): bool
    {
        return $this->quantity_on_hand <= $this->reorder_level;
    }
}
