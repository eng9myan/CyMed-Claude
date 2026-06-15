<?php

namespace Modules\PredictiveAnalytics\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PatientPrediction extends Model
{
    use HasUuids;

    protected $table = 'patient_predictions';

    protected $fillable = [
        'facility_id', 'patient_id', 'model_id', 'prediction_score',
        'risk_category', 'features_used', 'predicted_at',
    ];

    protected function casts(): array
    {
        return [
            'prediction_score' => 'decimal:4',
            'features_used'    => 'array',
            'predicted_at'     => 'datetime',
        ];
    }

    public function model()
    {
        return $this->belongsTo(PredictionModel::class, 'model_id');
    }
}
