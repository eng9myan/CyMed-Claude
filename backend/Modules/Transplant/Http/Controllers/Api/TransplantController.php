<?php

namespace Modules\Transplant\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Transplant\Models\TransplantCase;
use Modules\Transplant\Models\TransplantFollowup;
use Modules\Transplant\Models\TransplantWaitlist;

class TransplantController extends Controller
{
    public function waitlist(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('transplant.view')) {
            abort(403);
        }

        $query = TransplantWaitlist::query()
            ->with(['patient:id,first_name,last_name,mrn', 'registeredBy:id,first_name,last_name']);

        if ($request->has('organ_type')) {
            $query->where('organ_type', $request->organ_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $waitlist = $query->orderByDesc('registered_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $waitlist->items(),
            'meta' => [
                'total' => $waitlist->total(),
                'per_page' => $waitlist->perPage(),
                'current_page' => $waitlist->currentPage(),
                'last_page' => $waitlist->lastPage(),
            ],
        ]);
    }

    public function addToWaitlist(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('transplant.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'organ_type' => ['required', 'in:kidney,liver,heart,lung,pancreas,cornea,bone_marrow,small_bowel'],
            'blood_group' => ['required', 'string', 'max:5'],
            'urgency_score' => ['nullable', 'numeric'],
            'hla_typing' => ['nullable', 'array'],
            'pra_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'medical_urgency' => ['required', 'in:routine,urgent,super_urgent'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['registered_by'] = $authUser->id;
        $validated['registered_at'] = now();
        $validated['status'] = 'active';

        $entry = TransplantWaitlist::create($validated);

        return response()->json([
            'data' => $entry->load(['patient:id,first_name,last_name,mrn', 'registeredBy:id,first_name,last_name']),
            'message' => 'Patient added to transplant waitlist.',
        ], 201);
    }

    public function cases(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('transplant.view')) {
            abort(403);
        }

        $cases = TransplantCase::query()
            ->with(['recipient:id,first_name,last_name,mrn', 'surgeon:id,first_name,last_name'])
            ->orderByDesc('transplant_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $cases->items(),
            'meta' => [
                'total' => $cases->total(),
                'per_page' => $cases->perPage(),
                'current_page' => $cases->currentPage(),
                'last_page' => $cases->lastPage(),
            ],
        ]);
    }

    public function storeCase(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('transplant.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'recipient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'waitlist_id' => ['nullable', 'uuid', 'exists:transplant_waitlists,id'],
            'organ_type' => ['required', 'in:kidney,liver,heart,lung,pancreas,cornea,bone_marrow,small_bowel'],
            'donor_type' => ['required', 'in:deceased,living_related,living_unrelated'],
            'transplant_date' => ['required', 'date'],
            'cold_ischemia_time_hours' => ['nullable', 'numeric', 'min:0'],
            'warm_ischemia_time_minutes' => ['nullable', 'integer', 'min:0'],
            'hla_match_score' => ['nullable', 'integer', 'min:0', 'max:6'],
            'immunosuppression_protocol' => ['nullable', 'string'],
            'outcome' => ['required', 'in:functioning,delayed_graft_function,primary_non_function,rejection,patient_deceased'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['surgeon_id'] = $authUser->id;
        $validated['case_number'] = TransplantCase::generateCaseNumber();

        // Update waitlist status if a waitlist entry is linked
        if (! empty($validated['waitlist_id'])) {
            TransplantWaitlist::where('id', $validated['waitlist_id'])
                ->update(['status' => 'transplanted']);
        }

        $case = TransplantCase::create($validated);

        return response()->json([
            'data' => $case->load(['recipient:id,first_name,last_name,mrn', 'surgeon:id,first_name,last_name']),
            'message' => 'Transplant case recorded.',
        ], 201);
    }

    public function followups(Request $request, TransplantCase $transplantCase): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('transplant.view')) {
            abort(403);
        }

        $followups = TransplantFollowup::where('transplant_case_id', $transplantCase->id)
            ->with(['clinician:id,first_name,last_name'])
            ->orderByDesc('followup_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $followups->items(),
            'meta' => [
                'total' => $followups->total(),
                'per_page' => $followups->perPage(),
                'current_page' => $followups->currentPage(),
                'last_page' => $followups->lastPage(),
            ],
        ]);
    }

    public function storeFollowup(Request $request, TransplantCase $transplantCase): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('transplant.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'followup_date' => ['required', 'date'],
            'days_post_transplant' => ['nullable', 'integer', 'min:0'],
            'graft_function' => ['required', 'in:excellent,good,fair,poor,failed'],
            'rejection_episode' => ['nullable', 'boolean'],
            'rejection_type' => ['nullable', 'in:hyperacute,acute_cellular,antibody_mediated,chronic'],
            'biopsy_done' => ['nullable', 'boolean'],
            'biopsy_result' => ['nullable', 'string'],
            'immunosuppression_adjustment' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['transplant_case_id'] = $transplantCase->id;
        $validated['patient_id'] = $transplantCase->recipient_id;
        $validated['clinician_id'] = $authUser->id;

        $followup = TransplantFollowup::create($validated);

        return response()->json([
            'data' => $followup->load(['clinician:id,first_name,last_name']),
            'message' => 'Follow-up recorded.',
        ], 201);
    }
}
