<?php

namespace Modules\Procurement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;

class PurchaseOrder extends Model
{
    use HasUuids;

    protected $table = 'purchase_orders';

    protected $fillable = [
        'po_number',
        'facility_id',
        'vendor_id',
        'requested_by',
        'approved_by',
        'status',
        'order_date',
        'expected_delivery',
        'notes',
        'subtotal',
        'tax_amount',
        'total_amount',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'approved_at' => 'datetime',
            'order_date' => 'date',
            'expected_delivery' => 'date',
        ];
    }

    public static function generatePoNumber(): string
    {
        $year = date('Y');
        $prefix = "PO-{$year}-";
        $rows = DB::select(
            "SELECT MAX(CAST(SUBSTRING(po_number FROM LENGTH(?) + 1) AS INTEGER)) as max_seq FROM purchase_orders WHERE po_number LIKE ?",
            [$prefix, $prefix . '%']
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return $prefix . str_pad($seq, 6, '0', STR_PAD_LEFT);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'po_id');
    }
}
