<?php

namespace Modules\Patient\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Modules\Patient\Models\Patient;
use App\Services\Fhir\FhirService;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function __construct(
        protected FhirService $fhirService,
        protected AuditService $auditService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Patient::class);

        $patients = Patient::active()
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->facility_id, fn($q) => $q->where('facility_id', $request->facility_id))
            ->with(['primaryInsurance', 'activeAllergies'])
            ->paginate($request->per_page ?? 20);

        return response()->json($patients);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Patient::class);

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:M,F,U',
            'nationality' => 'required|string|size:2',
            'national_id' => 'nullable|string|max:20',
            'iqama_number' => 'nullable|string|max:20',
            'passport_number' => 'nullable|string|max:20',
            'phone_primary' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-,Unknown',
            'primary_language' => 'nullable|string|max:5',
            'facility_id' => 'required|uuid|exists:facilities,id',
        ]);

        $patient = DB::transaction(function () use ($validated, $request) {
            $validated['mrn'] = Patient::generateMrn();
            $validated['registered_by'] = auth()->id();
            $patient = Patient::create($validated);

            $this->auditService->logPhiAccess('Patient', $patient->id, 'created');
            return $patient;
        });

        return response()->json([
            'data' => $patient->load(['primaryInsurance', 'activeAllergies']),
            'fhir' => $this->fhirService->patientToFhir($patient->toArray()),
        ], 201);
    }

    public function show(Request $request, Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);
        $this->auditService->logPhiAccess('Patient', $patient->id, 'viewed');

        $patient->load([
            'primaryInsurance.insurer',
            'activeAllergies',
            'activeProblems',
            'encounters' => fn($q) => $q->latest()->limit(5),
        ]);

        return response()->json([
            'data' => $patient,
            'fhir' => $this->fhirService->patientToFhir($patient->toArray()),
        ]);
    }

    public function update(Request $request, Patient $patient): JsonResponse
    {
        $this->authorize('update', $patient);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'phone_primary' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'addresses' => 'nullable|array',
            'emergency_contacts' => 'nullable|array',
        ]);

        $patient->update($validated + ['updated_by' => auth()->id()]);
        $this->auditService->logPhiAccess('Patient', $patient->id, 'updated');

        return response()->json(['data' => $patient]);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $this->authorize('delete', $patient);
        $patient->delete();
        return response()->json(null, 204);
    }

    public function allergies(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);
        $this->auditService->logPhiAccess('Patient', $patient->id, 'viewed_allergies');
        return response()->json(['data' => $patient->allergies()->get()]);
    }

    public function storeAllergy(Request $request, Patient $patient): JsonResponse
    {
        $this->authorize('update', $patient);
        $validated = $request->validate([
            'allergen_type' => 'required|in:drug,food,environmental,latex,contrast,other',
            'allergen_name' => 'required|string|max:200',
            'severity' => 'required|in:mild,moderate,severe,life_threatening,unknown',
            'reaction_type' => 'nullable|string',
        ]);
        $allergy = $patient->allergies()->create($validated + ['recorded_by' => auth()->id()]);
        return response()->json(['data' => $allergy], 201);
    }

    public function problems(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);
        return response()->json(['data' => $patient->activeProblems()->get()]);
    }

    public function medications(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);
        return response()->json(['data' => []]);
    }

    public function timeline(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);
        $this->auditService->logPhiAccess('Patient', $patient->id, 'viewed_timeline');
        return response()->json(['data' => []]);
    }

    public function summary(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);
        $this->auditService->logPhiAccess('Patient', $patient->id, 'viewed_summary');

        return response()->json([
            'patient' => $patient->only(['id', 'mrn', 'full_name', 'age', 'gender', 'blood_group']),
            'active_allergies' => $patient->activeAllergies()->count(),
            'active_problems' => $patient->activeProblems()->count(),
            'total_encounters' => $patient->encounters()->count(),
            'last_visit' => $patient->encounters()->latest()->value('arrived_at'),
        ]);
    }
}
