<?php

namespace Modules\AssetManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class Asset extends Model
{
    use HasUuids;

    protected $table = 'assets';

    protected $fillable = [
        'asset_tag',
        'facility_id',
        'asset_name',
        'asset_type',
        'manufacturer',
        'model',
        'serial_number',
        'purchase_date',
        'purchase_price',
        'warranty_expiry',
        'location',
        'assigned_to',
        'status',
        'last_maintenance_at',
        'next_maintenance_due',
    ];

    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'purchase_date' => 'date',
            'warranty_expiry' => 'date',
            'next_maintenance_due' => 'date',
            'last_maintenance_at' => 'datetime',
        ];
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function maintenanceLogs()
    {
        return $this->hasMany(MaintenanceLog::class);
    }
}
