<?php

namespace Modules\Research\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Research\Models\IrbSubmission;
use Modules\Research\Models\IrbAmendment;
use Modules\Research\Models\ClinicalTrial;
use Modules\Research\Models\TrialEnrollment;
use Modules\Research\Models\TrialAdverseEvent;
use Modules\Research\Models\ResearchGrant;
use Modules\Research\Models\GrantExpenditure;
use Modules\Research\Models\BiobankSample;
use Modules\Research\Models\ResearchPublication;

class ResearchController extends Controller
{
    // ── IRB (Wave 45) ──────────────────────────────────────────────────────

    public function irbIndex(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.irb.view')) {
            abort(403);
        }

        $query = IrbSubmission::with(['principalInvestigator:id,first_name,last_name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('study_type')) {
            $query->where('study_type', $request->study_type);
        }

        $submissions = $query->orderByDesc('submission_date')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $submissions->items(),
            'meta' => [
                'total' => $submissions->total(),
                'per_page' => $submissions->perPage(),
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
            ],
        ]);
    }

    public function irbStore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.irb.submit')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'principal_investigator_id' => ['required', 'uuid', 'exists:users,id'],
            'title' => ['required', 'string', 'max:500'],
            'study_type' => ['required', 'in:observational,interventional,retrospective,case_study'],
            'review_type' => ['nullable', 'in:full,expedited,exempt'],
            'summary' => ['nullable', 'string'],
            'expected_subjects' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'involves_minors' => ['nullable', 'boolean'],
            'involves_vulnerable' => ['nullable', 'boolean'],
        ]);

        $submission = IrbSubmission::create(array_merge($validated, [
            'submission_number' => IrbSubmission::generateSubmissionNumber(),
            'submission_date' => now()->toDateString(),
            'status' => 'submitted',
            'review_type' => $validated['review_type'] ?? 'full',
        ]));

        return response()->json([
            'data' => $submission->load('principalInvestigator:id,first_name,last_name'),
            'message' => 'IRB submission created.',
        ], 201);
    }

    public function irbReview(Request $request, IrbSubmission $irbSubmission): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.irb.review')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected,suspended'],
            'reviewer_comments' => ['nullable', 'string'],
        ]);

        $irbSubmission->update([
            'status' => $validated['status'],
            'reviewer_comments' => $validated['reviewer_comments'] ?? null,
            'reviewed_by' => $authUser->id,
            'review_date' => now()->toDateString(),
        ]);

        return response()->json([
            'data' => $irbSubmission->fresh(),
            'message' => 'IRB submission reviewed.',
        ]);
    }

    public function irbAmend(Request $request, IrbSubmission $irbSubmission): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.irb.submit')) {
            abort(403);
        }

        $validated = $request->validate([
            'description' => ['required', 'string'],
        ]);

        $count = $irbSubmission->amendments()->count() + 1;
        $amendment = IrbAmendment::create([
            'irb_submission_id' => $irbSubmission->id,
            'amendment_number' => 'A' . str_pad((string) $count, 2, '0', STR_PAD_LEFT),
            'amendment_date' => now()->toDateString(),
            'description' => $validated['description'],
            'status' => 'pending',
            'submitted_by' => $authUser->id,
        ]);

        return response()->json([
            'data' => $amendment,
            'message' => 'Amendment submitted.',
        ], 201);
    }

    // ── Clinical Trials (Wave 46) ───────────────────────────────────────────

    public function trialsIndex(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.trials.view')) {
            abort(403);
        }

        $query = ClinicalTrial::with(['principalInvestigator:id,first_name,last_name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('phase')) {
            $query->where('phase', $request->phase);
        }

        $trials = $query->orderByDesc('created_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $trials->items(),
            'meta' => [
                'total' => $trials->total(),
                'per_page' => $trials->perPage(),
                'current_page' => $trials->currentPage(),
                'last_page' => $trials->lastPage(),
            ],
        ]);
    }

    public function trialsStore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.trials.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'irb_submission_id' => ['nullable', 'uuid', 'exists:irb_submissions,id'],
            'principal_investigator_id' => ['required', 'uuid', 'exists:users,id'],
            'title' => ['required', 'string', 'max:500'],
            'phase' => ['nullable', 'in:Phase 1,Phase 2,Phase 3,Phase 4'],
            'sponsor' => ['nullable', 'string', 'max:200'],
            'clinicaltrials_gov_id' => ['nullable', 'string', 'max:20'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'target_enrollment' => ['nullable', 'integer', 'min:1'],
            'intervention_type' => ['nullable', 'in:drug,device,behavioral,procedure'],
            'inclusion_criteria' => ['nullable', 'string'],
            'exclusion_criteria' => ['nullable', 'string'],
        ]);

        $trial = ClinicalTrial::create(array_merge($validated, [
            'trial_number' => ClinicalTrial::generateTrialNumber(),
            'status' => 'recruiting',
        ]));

        return response()->json([
            'data' => $trial->load('principalInvestigator:id,first_name,last_name'),
            'message' => 'Clinical trial registered.',
        ], 201);
    }

    public function trialsEnroll(Request $request, ClinicalTrial $clinicalTrial): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.trials.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'arm' => ['nullable', 'string', 'max:100'],
        ]);

        $enrollment = TrialEnrollment::create([
            'clinical_trial_id' => $clinicalTrial->id,
            'patient_id' => $validated['patient_id'],
            'enrollment_date' => now()->toDateString(),
            'arm' => $validated['arm'] ?? null,
            'status' => 'active',
        ]);

        return response()->json([
            'data' => $enrollment->load('patient:id,first_name,last_name,mrn'),
            'message' => 'Patient enrolled in trial.',
        ], 201);
    }

    public function trialsReportAdverseEvent(Request $request, ClinicalTrial $clinicalTrial): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.trials.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'event_date' => ['required', 'date'],
            'event_description' => ['required', 'string', 'max:500'],
            'severity' => ['required', 'in:mild,moderate,severe,life_threatening,fatal'],
            'relatedness' => ['required', 'in:unrelated,unlikely,possible,probable,definite'],
            'is_serious' => ['nullable', 'boolean'],
        ]);

        $event = TrialAdverseEvent::create(array_merge($validated, [
            'clinical_trial_id' => $clinicalTrial->id,
            'reported_by' => $authUser->id,
            'was_reported' => true,
        ]));

        return response()->json([
            'data' => $event->load('patient:id,first_name,last_name,mrn'),
            'message' => 'Adverse event reported.',
        ], 201);
    }

    // ── Grants (Wave 47) ────────────────────────────────────────────────────

    public function grantsIndex(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.grants.view')) {
            abort(403);
        }

        $query = ResearchGrant::with(['principalInvestigator:id,first_name,last_name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $grants = $query->orderByDesc('start_date')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $grants->items(),
            'meta' => [
                'total' => $grants->total(),
                'per_page' => $grants->perPage(),
                'current_page' => $grants->currentPage(),
                'last_page' => $grants->lastPage(),
            ],
        ]);
    }

    public function grantsStore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.grants.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'principal_investigator_id' => ['required', 'uuid', 'exists:users,id'],
            'title' => ['required', 'string', 'max:500'],
            'funding_agency' => ['required', 'string', 'max:200'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'objectives' => ['nullable', 'string'],
        ]);

        $grant = ResearchGrant::create(array_merge($validated, [
            'grant_number' => ResearchGrant::generateGrantNumber(),
            'currency' => $validated['currency'] ?? 'SAR',
            'status' => 'active',
        ]));

        return response()->json([
            'data' => $grant->load('principalInvestigator:id,first_name,last_name'),
            'message' => 'Research grant recorded.',
        ], 201);
    }

    public function grantsAddExpenditure(Request $request, ResearchGrant $researchGrant): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.grants.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'category' => ['required', 'in:personnel,equipment,supplies,travel,indirect,other'],
            'description' => ['required', 'string', 'max:300'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expenditure_date' => ['nullable', 'date'],
        ]);

        $expenditure = GrantExpenditure::create([
            'research_grant_id' => $researchGrant->id,
            'expenditure_date' => $validated['expenditure_date'] ?? now()->toDateString(),
            'category' => $validated['category'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'currency' => $researchGrant->currency,
            'recorded_by' => $authUser->id,
        ]);

        return response()->json([
            'data' => $expenditure,
            'message' => 'Expenditure recorded.',
        ], 201);
    }

    // ── Biobank (Wave 48) ───────────────────────────────────────────────────

    public function biobankIndex(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.biobank.view')) {
            abort(403);
        }

        $query = BiobankSample::with(['patient:id,first_name,last_name,mrn']);

        if ($request->has('sample_type')) {
            $query->where('sample_type', $request->sample_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        $samples = $query->orderByDesc('collected_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $samples->items(),
            'meta' => [
                'total' => $samples->total(),
                'per_page' => $samples->perPage(),
                'current_page' => $samples->currentPage(),
                'last_page' => $samples->lastPage(),
            ],
        ]);
    }

    public function biobankStore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.biobank.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'sample_type' => ['required', 'in:blood,tissue,urine,csf,saliva,dna,rna,ffpe,stool,bone_marrow'],
            'collection_method' => ['nullable', 'string', 'max:50'],
            'volume_ml' => ['nullable', 'numeric', 'min:0'],
            'storage_location' => ['nullable', 'string', 'max:100'],
            'storage_temperature' => ['nullable', 'numeric'],
            'expiry_date' => ['nullable', 'date'],
            'metadata' => ['nullable', 'array'],
        ]);

        $barcode = 'BIO-' . now()->year . '-' . strtoupper(substr(uniqid(), -8));

        $sample = BiobankSample::create(array_merge($validated, [
            'barcode' => $barcode,
            'collected_at' => now(),
            'collected_by' => $authUser->id,
            'status' => 'available',
        ]));

        return response()->json([
            'data' => $sample->load('patient:id,first_name,last_name,mrn'),
            'message' => 'Biobank sample registered.',
        ], 201);
    }

    // ── Publications (Wave 49) ──────────────────────────────────────────────

    public function publicationsIndex(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.publications.view')) {
            abort(403);
        }

        $query = ResearchPublication::with(['correspondingAuthor:id,first_name,last_name']);

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('publication_type')) {
            $query->where('publication_type', $request->publication_type);
        }

        if ($request->has('year')) {
            $query->where('publication_year', $request->year);
        }

        $pubs = $query->orderByDesc('publication_year')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $pubs->items(),
            'meta' => [
                'total' => $pubs->total(),
                'per_page' => $pubs->perPage(),
                'current_page' => $pubs->currentPage(),
                'last_page' => $pubs->lastPage(),
            ],
        ]);
    }

    public function publicationsStore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('research.publications.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'title' => ['required', 'string', 'max:500'],
            'publication_type' => ['required', 'in:journal_article,conference_paper,book_chapter,thesis,report'],
            'journal_name' => ['nullable', 'string', 'max:300'],
            'doi' => ['nullable', 'string', 'max:100', 'unique:research_publications,doi'],
            'pubmed_id' => ['nullable', 'string', 'max:20'],
            'publication_year' => ['required', 'integer', 'min:1900', 'max:' . (now()->year + 1)],
            'volume' => ['nullable', 'string', 'max:20'],
            'issue' => ['nullable', 'string', 'max:20'],
            'pages' => ['nullable', 'string', 'max:30'],
            'authors' => ['required', 'array', 'min:1'],
            'impact_factor' => ['nullable', 'string', 'max:10'],
            'corresponding_author_id' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $publication = ResearchPublication::create($validated);

        return response()->json([
            'data' => $publication,
            'message' => 'Publication recorded.',
        ], 201);
    }
}
