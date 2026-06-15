<?php

namespace Modules\DataWarehouse\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BiReportDefinition extends Model
{
    use HasUuids;

    protected $table = 'bi_report_definitions';

    protected $fillable = [
        'facility_id', 'report_code', 'report_name', 'category', 'data_source',
        'query_definition', 'parameters', 'output_columns', 'refresh_frequency',
        'is_public', 'is_active', 'created_by',
    ];

    protected $casts = [
        'parameters' => 'array',
        'output_columns' => 'array',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
    ];
}
