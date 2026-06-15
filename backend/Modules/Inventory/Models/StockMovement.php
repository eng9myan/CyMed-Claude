<?php

namespace Modules\Inventory\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasUuids;

    protected $table = 'stock_movements';

    protected $fillable = [
        'inventory_item_id', 'movement_type', 'quantity',
        'before_qty', 'after_qty', 'unit_cost',
        'reference_type', 'reference_id',
        'performed_by', 'notes', 'performed_at',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'before_qty' => 'decimal:2',
        'after_qty' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'performed_at' => 'datetime',
    ];

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
