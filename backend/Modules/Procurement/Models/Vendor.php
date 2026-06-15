<?php

namespace Modules\Procurement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasUuids;

    protected $table = 'vendors';

    protected $fillable = [
        'vendor_code',
        'name',
        'name_ar',
        'vendor_type',
        'contact_person',
        'phone',
        'email',
        'address',
        'country',
        'tax_number',
        'iban',
        'payment_terms',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
