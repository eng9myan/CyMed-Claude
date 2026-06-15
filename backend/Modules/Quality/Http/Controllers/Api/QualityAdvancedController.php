<?php

namespace Modules\Quality\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Quality\Models\AccreditationCycle;
use Modules\Quality\Models\QualityIndicator;
use Modules\Quality\Models\QualityMeasurement;

class QualityAdvancedController extends Controller
{
    public function indicators(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.kpis.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $query = QualityIndicator::where('facility_id', $validated['facility_id'])
            ->where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $indicators = $query->orderBy('category')->orderBy('indicator_name')->get();

        return response()->json(['data' => $indicators]);
    }

    public function storeIndicator(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.accreditation.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'indicator_code' => ['required', 'string', 'max:30', 'unique:quality_indicators,indicator_code'],
            'indicator_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:patient_safety,clinical_effectiveness,patient_experience,efficiency'],
            'measurement_type' => ['required', 'in:rate,ratio,count,mean'],
            'target_value' => ['nullable', 'numeric'],
            'reporting_period' => ['sometimes', 'in:daily,weekly,monthly,quarterly'],
            'numerator_desc' => ['nullable', 'string'],
            'denominator_desc' => ['nullable', 'string'],
            'is_joint_commission' => ['sometimes', 'boolean'],
        ]);

        $indicator = QualityIndicator::create($validated);

        return response()->json([
            'data' => $indicator,
            'message' => 'Quality indicator created.',
        ], 201);
    }

    public function recordMeasurement(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.kpis.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'indicator_id' => ['required', 'uuid', 'exists:quality_indicators,id'],
            'period' => ['required', 'string', 'max:20'],
            'numerator' => ['nullable', 'numeric'],
            'denominator' => ['nullable', 'numeric'],
            'result_value' => ['required', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        $indicator = QualityIndicator::findOrFail($validated['indicator_id']);
        $targetMet = $indicator->target_value !== null
            && $validated['result_value'] >= $indicator->target_value;

        $measurement = QualityMeasurement::updateOrCreate(
            ['indicator_id' => $validated['indicator_id'], 'period' => $validated['period']],
            array_merge($validated, [
                'target_value' => $indicator->target_value,
                'target_met' => $targetMet,
                'recorded_by' => $authUser->id,
            ])
        );

        return response()->json([
            'data' => $measurement,
            'message' => 'Measurement recorded.',
        ], 201);
    }

    public function accreditationCycles(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.accreditation.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $cycles = AccreditationCycle::where('facility_id', $validated['facility_id'])
            ->orderByDesc('survey_date')
            ->get();

        return response()->json(['data' => $cycles]);
    }

    public function storeAccreditationCycle(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('quality.accreditation.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'accreditation_body' => ['required', 'string', 'max:100'],
            'cycle_name' => ['required', 'string', 'max:100'],
            'survey_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:in_preparation,surveyed,accredited,conditional,denied'],
        ]);

        $cycle = AccreditationCycle::create($validated);

        return response()->json([
            'data' => $cycle,
            'message' => 'Accreditation cycle created.',
        ], 201);
    }
}
