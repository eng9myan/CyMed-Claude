<?php

namespace Modules\ClinicalDecisionSupport\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ClinicalDecisionSupport\Models\CdsAlert;
use Modules\ClinicalDecisionSupport\Models\CdsRule;

class CdsController extends Controller
{
    public function rules(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cds.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $rules = CdsRule::where('facility_id', $validated['facility_id'])
            ->where('is_active', true)
            ->get();

        return response()->json(['data' => $rules]);
    }

    public function createRule(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cds.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'     => ['required', 'uuid', 'exists:facilities,id'],
            'rule_code'       => ['required', 'string', 'unique:cds_rules,rule_code'],
            'rule_name'       => ['required', 'string'],
            'category'        => ['required', 'string', 'max:50'],
            'condition'       => ['required', 'array'],
            'recommendations' => ['required', 'array'],
            'severity'        => ['required', 'in:info,warning,critical'],
        ]);

        $rule = CdsRule::create(array_merge($validated, [
            'created_by' => $authUser->id,
            'is_active'  => true,
        ]));

        return response()->json($rule, 201);
    }

    public function checkAlerts(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cds.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id'  => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $alerts = CdsAlert::where('facility_id', $validated['facility_id'])
            ->where('patient_id', $validated['patient_id'])
            ->where('acknowledged', false)
            ->with('rule')
            ->get();

        return response()->json(['data' => $alerts]);
    }

    public function acknowledgeAlert(Request $request, CdsAlert $cdsAlert): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cds.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'override_reason' => ['nullable', 'string'],
        ]);

        $cdsAlert->update(array_merge($validated, [
            'acknowledged'    => true,
            'acknowledged_by' => $authUser->id,
            'acknowledged_at' => now(),
        ]));

        return response()->json(['message' => 'Alert acknowledged.', 'data' => $cdsAlert]);
    }

    public function triageAssessment(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cds.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id'    => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id'     => ['required', 'uuid', 'exists:patients,id'],
            'symptoms'       => ['required', 'array'],
            'chief_complaint'=> ['required', 'string'],
        ]);

        // Compute a mock triage level based on symptom count
        $symptomCount = count($validated['symptoms']);
        if ($symptomCount >= 5) {
            $triageLevel = 1; // Resuscitation
        } elseif ($symptomCount >= 3) {
            $triageLevel = 2; // Emergent
        } elseif ($symptomCount >= 2) {
            $triageLevel = 3; // Urgent
        } elseif ($symptomCount >= 1) {
            $triageLevel = 4; // Less Urgent
        } else {
            $triageLevel = 5; // Non-Urgent
        }

        $triageLabels = [
            1 => 'Resuscitation',
            2 => 'Emergent',
            3 => 'Urgent',
            4 => 'Less Urgent',
            5 => 'Non-Urgent',
        ];

        return response()->json([
            'triage_level'       => $triageLevel,
            'triage_label'       => $triageLabels[$triageLevel],
            'chief_complaint'    => $validated['chief_complaint'],
            'symptoms_evaluated' => $symptomCount,
        ]);
    }
}
