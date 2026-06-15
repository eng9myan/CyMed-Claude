<?php

namespace Modules\EMR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Patient\Models\Encounter;

class EncounterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.view', 'patient.view'])) {
            abort(403);
        }

        $encounters = Encounter::with(['patient:id,first_name,last_name,mrn', 'attendingPhysician:id,first_name,last_name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->encounter_type, fn ($q, $v) => $q->where('encounter_type', $v))
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->orderByDesc('arrived_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $encounters->items(),
            'meta' => [
                'total' => $encounters->total(),
                'per_page' => $encounters->perPage(),
                'current_page' => $encounters->currentPage(),
                'last_page' => $encounters->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['admissions.admit', 'patients.create'])) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'department_id' => ['nullable', 'uuid', 'exists:departments,id'],
            'encounter_type' => ['required', 'in:outpatient,inpatient,emergency,observation,day_surgery,telemedicine'],
            'admission_type' => ['nullable', 'in:emergency,urgent,elective,newborn,trauma'],
            'chief_complaint' => ['nullable', 'string', 'max:500'],
            'attending_physician_id' => ['nullable', 'uuid', 'exists:users,id'],
            'payment_method' => ['nullable', 'in:insurance,cash,government,charity'],
            'transport_mode' => ['nullable', 'in:ambulance,private,walk_in'],
        ]);

        // Prevent duplicate active encounter
        $hasActive = Encounter::where('patient_id', $validated['patient_id'])
            ->where('status', 'active')
            ->exists();

        if ($hasActive) {
            return response()->json(['message' => 'Patient already has an active encounter.'], 422);
        }

        $validated['encounter_number'] = Encounter::generateEncounterNumber();
        $validated['arrived_at'] = now();
        $validated['registered_at'] = now();
        $validated['status'] = 'active';

        $encounter = Encounter::create($validated);

        return response()->json([
            'data' => $encounter->load(['patient:id,first_name,last_name,mrn', 'attendingPhysician:id,first_name,last_name']),
            'message' => 'Encounter opened.',
        ], 201);
    }

    public function show(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['patients.view', 'patient.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $encounter->load(['patient', 'attendingPhysician']),
        ]);
    }

    public function update(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['admissions.admit', 'patients.update'])) {
            abort(403);
        }

        $validated = $request->validate([
            'chief_complaint' => ['nullable', 'string', 'max:500'],
            'attending_physician_id' => ['nullable', 'uuid', 'exists:users,id'],
            'department_id' => ['nullable', 'uuid', 'exists:departments,id'],
            'payment_method' => ['nullable', 'in:insurance,cash,government,charity'],
        ]);

        $encounter->update($validated);

        return response()->json(['data' => $encounter->fresh()]);
    }

    public function destroy(Encounter $encounter): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasAnyPermission(['admissions.discharge', 'patients.delete'])) {
            abort(403);
        }

        $encounter->update(['status' => 'cancelled']);
        \Illuminate\Support\Facades\DB::table('encounters')
            ->where('id', $encounter->id)
            ->update(['cancelled_at' => now()]);
        $encounter->delete();

        return response()->json(null, 204);
    }

    public function discharge(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['admissions.discharge'])) {
            abort(403);
        }

        if ($encounter->status !== 'active') {
            return response()->json(['message' => 'Only active encounters can be discharged.'], 422);
        }

        $validated = $request->validate([
            'discharge_disposition' => ['required', 'in:home,transfer,deceased,ama,skilled_nursing,hospice'],
            'primary_diagnosis_code' => ['nullable', 'string', 'max:20'],
            'primary_diagnosis_name' => ['nullable', 'string', 'max:500'],
        ]);

        $encounter->update(array_merge($validated, [
            'status' => 'finished',
            'discharged_at' => now(),
        ]));

        return response()->json([
            'data' => $encounter->fresh(),
            'message' => 'Patient discharged.',
        ]);
    }

    public function transfer(Request $request, Encounter $encounter): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['admissions.transfer'])) {
            abort(403);
        }

        if ($encounter->status !== 'active') {
            return response()->json(['message' => 'Only active encounters can be transferred.'], 422);
        }

        $validated = $request->validate([
            'department_id' => ['required', 'uuid', 'exists:departments,id'],
            'attending_physician_id' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $encounter->update($validated);

        return response()->json([
            'data' => $encounter->fresh(),
            'message' => 'Patient transferred.',
        ]);
    }
}
