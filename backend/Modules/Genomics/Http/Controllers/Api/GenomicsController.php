<?php

namespace Modules\Genomics\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Genomics\Models\GenomicTest;
use Modules\Genomics\Models\GenomicVariant;
use Modules\Genomics\Models\PharmacogenomicsReport;

class GenomicsController extends Controller
{
    public function orderTest(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('genomics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'test_type' => ['required', 'in:wgs,wes,panel,snp_array,cytogenetics,fish,pcr'],
            'panel_name' => ['nullable', 'string', 'max:200'],
            'lab_name' => ['nullable', 'string', 'max:200'],
        ]);

        $test = GenomicTest::create(array_merge($validated, [
            'test_number' => GenomicTest::generateTestNumber(),
            'ordered_by' => $authUser->id,
            'ordered_date' => now()->toDateString(),
            'status' => 'ordered',
        ]));

        return response()->json([
            'data' => $test->load('patient:id,first_name,last_name,mrn'),
            'message' => 'Genomic test ordered.',
        ], 201);
    }

    public function patientTests(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('genomics.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $tests = GenomicTest::where('patient_id', $validated['patient_id'])
            ->with(['orderedBy:id,first_name,last_name'])
            ->orderByDesc('ordered_date')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $tests->items(),
            'meta' => ['total' => $tests->total(), 'per_page' => $tests->perPage(), 'current_page' => $tests->currentPage(), 'last_page' => $tests->lastPage()],
        ]);
    }

    public function recordVariants(Request $request, GenomicTest $genomicTest): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('genomics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.gene' => ['required', 'string', 'max:50'],
            'variants.*.variant' => ['required', 'string', 'max:200'],
            'variants.*.transcript' => ['nullable', 'string', 'max:100'],
            'variants.*.zygosity' => ['nullable', 'in:heterozygous,homozygous,hemizygous'],
            'variants.*.classification' => ['required', 'in:pathogenic,likely_pathogenic,vus,likely_benign,benign'],
            'variants.*.inheritance' => ['nullable', 'in:AD,AR,XL,mitochondrial'],
            'variants.*.clinical_significance' => ['nullable', 'string'],
        ]);

        $created = [];
        foreach ($validated['variants'] as $variantData) {
            $created[] = GenomicVariant::create(array_merge($variantData, [
                'genomic_test_id' => $genomicTest->id,
            ]));
        }

        $genomicTest->update([
            'status' => 'resulted',
            'result_date' => now()->toDateString(),
        ]);

        return response()->json([
            'data' => $created,
            'message' => count($created) . ' variant(s) recorded.',
        ], 201);
    }

    public function pharmReport(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('genomics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'genomic_test_id' => ['nullable', 'uuid', 'exists:genomic_tests,id'],
            'gene' => ['required', 'string', 'max:50'],
            'diplotype' => ['nullable', 'string', 'max:50'],
            'phenotype' => ['nullable', 'in:poor,intermediate,normal,rapid,ultrarapid'],
            'drug' => ['required', 'string', 'max:150'],
            'recommendation' => ['required', 'in:normal_dose,reduced_dose,increased_dose,avoid,use_alternative'],
            'clinical_notes' => ['nullable', 'string'],
        ]);

        $report = PharmacogenomicsReport::create($validated);

        return response()->json([
            'data' => $report->load('patient:id,first_name,last_name,mrn'),
            'message' => 'Pharmacogenomics report recorded.',
        ], 201);
    }

    public function patientPharmReports(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('genomics.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $reports = PharmacogenomicsReport::where('patient_id', $validated['patient_id'])
            ->orderBy('gene')
            ->get();

        return response()->json(['data' => $reports]);
    }
}
