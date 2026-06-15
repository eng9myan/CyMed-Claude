<?php

namespace Modules\PredictiveAnalytics\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PredictionModel extends Model
{
    use HasUuids;

    protected $table = 'prediction_models';

    protected $fillable = [
        'facility_id', 'model_code', 'model_name', 'outcome_type',
        'feature_list', 'model_version', 'accuracy_score', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'feature_list'   => 'array',
            'is_active'      => 'boolean',
            'accuracy_score' => 'decimal:4',
        ];
    }

    public function predictions()
    {
        return $this->hasMany(PatientPrediction::class, 'model_id');
    }
}
