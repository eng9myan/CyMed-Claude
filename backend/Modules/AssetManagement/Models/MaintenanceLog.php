<?php

namespace Modules\AssetManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MaintenanceLog extends Model
{
    use HasUuids;

    protected $table = 'maintenance_logs';

    protected $fillable = [
        'asset_id',
        'performed_by',
        'maintenance_type',
        'description',
        'cost',
        'performed_at',
        'next_due_date',
        'parts_replaced',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'performed_at' => 'datetime',
            'next_due_date' => 'date',
            'parts_replaced' => 'array',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
