<?php

namespace Modules\Procurement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Inventory\Models\InventoryItem;

class PurchaseOrderItem extends Model
{
    use HasUuids;

    protected $table = 'purchase_order_items';

    protected $fillable = [
        'po_id',
        'inventory_item_id',
        'item_description',
        'quantity_ordered',
        'quantity_received',
        'unit_price',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity_ordered' => 'decimal:2',
            'quantity_received' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'po_id');
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
