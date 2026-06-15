<?php

namespace Modules\Dental\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Dental\Models\DentalChart;
use Modules\Dental\Models\DentalTreatment;

class DentalController extends Controller
{
    public function chart(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dental.view')) {
            abort(403);
        }

        $chart = DentalChart::firstOrCreate(
            ['patient_id' => $patientId],
            ['created_by' => $authUser->id, 'teeth_status' => []]
        );

        return response()->json([
            'data' => $chart->load(['createdBy:id,first_name,last_name']),
        ]);
    }

    public function updateChart(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dental.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'teeth_status' => ['required', 'array'],
        ]);

        $chart = DentalChart::firstOrCreate(
            ['patient_id' => $patientId],
            ['created_by' => $authUser->id, 'teeth_status' => []]
        );

        // Merge, not replace (use + to preserve string-numeric keys like tooth numbers)
        $existing = $chart->teeth_status ?? [];
        $merged = $validated['teeth_status'] + $existing;
        $chart->teeth_status = $merged;
        $chart->save();

        return response()->json([
            'data' => $chart->fresh(),
            'message' => 'Dental chart updated.',
        ]);
    }

    public function treatments(Request $request, string $patientId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dental.view')) {
            abort(403);
        }

        $treatments = DentalTreatment::where('patient_id', $patientId)
            ->with(['dentist:id,first_name,last_name'])
            ->orderByDesc('treatment_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $treatments->items(),
            'meta' => [
                'total' => $treatments->total(),
                'per_page' => $treatments->perPage(),
                'current_page' => $treatments->currentPage(),
                'last_page' => $treatments->lastPage(),
            ],
        ]);
    }

    public function storeTreatment(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dental.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['nullable', 'uuid', 'exists:encounters,id'],
            'tooth_numbers' => ['nullable', 'array'],
            'treatment_type' => ['required', 'in:examination,cleaning,filling,extraction,root_canal,crown,bridge,implant,whitening,orthodontics,other'],
            'procedure_code' => ['nullable', 'string', 'max:20'],
            'diagnosis' => ['nullable', 'string'],
            'treatment_notes' => ['nullable', 'string'],
            'materials_used' => ['nullable', 'string'],
            'treatment_date' => ['required', 'date'],
            'next_appointment_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:planned,in_progress,completed,cancelled'],
        ]);

        $validated['dentist_id'] = $authUser->id;
        $validated['status'] = $validated['status'] ?? 'planned';

        $treatment = DentalTreatment::create($validated);

        return response()->json([
            'data' => $treatment->load(['dentist:id,first_name,last_name']),
            'message' => 'Dental treatment recorded.',
        ], 201);
    }

    public function updateTreatment(Request $request, DentalTreatment $treatment): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('dental.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:planned,in_progress,completed,cancelled'],
            'treatment_notes' => ['nullable', 'string'],
            'next_appointment_date' => ['nullable', 'date'],
        ]);

        $treatment->update($validated);

        return response()->json([
            'data' => $treatment->fresh(),
            'message' => 'Dental treatment updated.',
        ]);
    }
}
