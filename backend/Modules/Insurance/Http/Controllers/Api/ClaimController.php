<?php

namespace Modules\Insurance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Nphies\NphiesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Client\RequestException;
use Modules\Insurance\Models\InsuranceClaim;

class ClaimController extends Controller
{
    public function __construct(private readonly NphiesService $nphies) {}

    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['insurance.claims.create', 'billing.invoices.view'])) {
            abort(403);
        }

        $claims = InsuranceClaim::with(['patient:id,first_name,last_name,mrn', 'insurer:id,name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->insurer_id, fn ($q, $v) => $q->where('insurer_id', $v))
            ->orderByDesc('claim_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $claims->items(),
            'meta' => [
                'total'        => $claims->total(),
                'per_page'     => $claims->perPage(),
                'current_page' => $claims->currentPage(),
                'last_page'    => $claims->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('insurance.claims.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'encounter_id'     => ['required', 'uuid', 'exists:encounters,id'],
            'patient_id'       => ['required', 'uuid', 'exists:patients,id'],
            'insurer_id'       => ['required', 'uuid', 'exists:insurers,id'],
            'insurance_id'     => ['required', 'uuid', 'exists:patient_insurances,id'],
            'claim_type'       => ['required', 'in:professional,institutional,pharmacy,dental'],
            'claim_date'       => ['required', 'date'],
            'service_from_date' => ['required', 'date'],
            'service_to_date'  => ['nullable', 'date', 'after_or_equal:service_from_date'],
            'billed_amount'    => ['required', 'numeric', 'min:0'],
        ]);

        $validated['claim_number'] = InsuranceClaim::generateClaimNumber();
        $validated['status']       = 'draft';
        $validated['created_by']   = $authUser->id;

        $claim = InsuranceClaim::create($validated);

        return response()->json([
            'data'    => $claim->load(['patient:id,first_name,last_name,mrn', 'insurer:id,name']),
            'message' => 'Claim created.',
        ], 201);
    }

    public function show(Request $request, InsuranceClaim $claim): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['insurance.claims.create', 'billing.invoices.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $claim->load(['patient', 'insurer']),
        ]);
    }

    public function update(Request $request, InsuranceClaim $claim): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('insurance.claims.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'status'         => ['sometimes', 'in:draft,scrubbed,submitted,acknowledged,processing,partially_paid,paid,denied,appealed,closed'],
            'approved_amount' => ['nullable', 'numeric', 'min:0'],
            'denial_reason'  => ['nullable', 'string'],
            'denial_code'    => ['nullable', 'string', 'max:20'],
            'notes'          => ['nullable', 'string'],
        ]);

        $claim->update($validated);

        return response()->json(['data' => $claim->fresh()]);
    }

    public function destroy(InsuranceClaim $claim): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('insurance.claims.create')) {
            abort(403);
        }

        if ($claim->status !== 'draft') {
            return response()->json(['message' => 'Only draft claims can be deleted.'], 422);
        }

        $claim->delete();

        return response()->json(null, 204);
    }

    public function submit(Request $request, InsuranceClaim $claim): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('insurance.claims.submit')) {
            abort(403);
        }

        if (! in_array($claim->status, ['draft', 'scrubbed'])) {
            return response()->json(['message' => 'Only draft or scrubbed claims can be submitted.'], 422);
        }

        $validated = $request->validate([
            'submission_method' => ['required', 'in:nphies,edi_837,portal,manual'],
        ]);

        $nphiesPayload = null;
        $nphiesRef     = null;

        if ($validated['submission_method'] === 'nphies') {
            try {
                $claim->load(['patient', 'insurer', 'insurance']);

                $result = $this->nphies->submitClaim([
                    'claim_id'     => $claim->id,
                    'claim_number' => $claim->claim_number,
                    'claim_type'   => $claim->claim_type,
                    'insurer_id'   => $claim->insurer?->nphies_id ?? $claim->insurer_id,
                    'patient'      => [
                        'national_id' => $claim->patient?->national_id ?? '',
                    ],
                    'insurance'    => [
                        'member_id'     => $claim->insurance?->member_id ?? '',
                        'policy_number' => $claim->insurance?->policy_number ?? '',
                    ],
                    'items'        => [],
                    'total_amount' => (float) $claim->billed_amount,
                ]);

                $nphiesPayload = json_encode($result['raw_request'] ?? []);
                $nphiesRef     = $result['nphies_reference'];
            } catch (RequestException $e) {
                return response()->json([
                    'message' => 'NPHIES submission failed: ' . $e->getMessage(),
                ], 502);
            }
        }

        $claim->update([
            'status'               => 'submitted',
            'submitted_at'         => now(),
            'submission_method'    => $validated['submission_method'],
            'submission_reference' => $nphiesRef ?? ('REF-' . strtoupper(substr(md5($claim->id . now()), 0, 10))),
            'nphies_request'       => $nphiesPayload,
        ]);

        return response()->json([
            'data'    => $claim->fresh(),
            'message' => 'Claim submitted.',
        ]);
    }

    public function appeal(Request $request, InsuranceClaim $claim): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('insurance.claims.appeal')) {
            abort(403);
        }

        if ($claim->status !== 'denied') {
            return response()->json(['message' => 'Only denied claims can be appealed.'], 422);
        }

        $validated = $request->validate([
            'appeal_reason' => ['required', 'string', 'max:1000'],
        ]);

        $claim->update([
            'status'        => 'appealed',
            'is_appealed'   => true,
            'appeal_count'  => $claim->appeal_count + 1,
            'notes'         => $validated['appeal_reason'],
        ]);

        return response()->json([
            'data'    => $claim->fresh(),
            'message' => 'Appeal submitted.',
        ]);
    }
}
