<?php

namespace Modules\PredictiveAnalytics\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\PredictiveAnalytics\Models\PatientPrediction;
use Modules\PredictiveAnalytics\Models\PredictionModel;

class PredictiveAnalyticsController extends Controller
{
    public function models(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('analytics.view')) {
            abort(403);
        }

        $models = PredictionModel::where('is_active', true)->get();

        return response()->json(['data' => $models]);
    }

    public function registerModel(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('analytics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'model_code'     => ['required', 'string', 'unique:prediction_models,model_code'],
            'model_name'     => ['required', 'string'],
            'outcome_type'   => ['required', 'string'],
            'feature_list'   => ['required', 'array'],
            'accuracy_score' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $model = PredictionModel::create(array_merge($validated, ['is_active' => true]));

        return response()->json($model, 201);
    }

    public function predict(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('analytics.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'model_id'    => ['required', 'uuid', 'exists:prediction_models,id'],
            'patient_id'  => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'features'    => ['required', 'array'],
        ]);

        // Mock score = count(features)/10 capped at 0.99
        $rawScore = count($validated['features']) / 10;
        $score    = min($rawScore, 0.99);

        if ($score < 0.3) {
            $riskCategory = 'low';
        } elseif ($score < 0.6) {
            $riskCategory = 'moderate';
        } elseif ($score < 0.8) {
            $riskCategory = 'high';
        } else {
            $riskCategory = 'critical';
        }

        $prediction = PatientPrediction::create([
            'facility_id'      => $validated['facility_id'],
            'patient_id'       => $validated['patient_id'],
            'model_id'         => $validated['model_id'],
            'prediction_score' => $score,
            'risk_category'    => $riskCategory,
            'features_used'    => $validated['features'],
            'predicted_at'     => now(),
        ]);

        return response()->json($prediction, 201);
    }

    public function patientPredictions(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('analytics.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $predictions = PatientPrediction::where('patient_id', $validated['patient_id'])
            ->with('model')
            ->orderByDesc('predicted_at')
            ->get();

        return response()->json(['data' => $predictions]);
    }

    public function highRiskPatients(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('analytics.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $patients = PatientPrediction::where('facility_id', $validated['facility_id'])
            ->whereIn('risk_category', ['high', 'critical'])
            ->orderByDesc('prediction_score')
            ->paginate(20);

        return response()->json($patients);
    }
}
