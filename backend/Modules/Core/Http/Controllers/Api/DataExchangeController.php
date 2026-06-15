<?php

namespace Modules\Core\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\DataExchangeJob;

class DataExchangeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('data.exchange.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $query = DataExchangeJob::where('facility_id', $validated['facility_id']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        $jobs = $query->orderByDesc('created_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $jobs->items(),
            'meta' => [
                'total' => $jobs->total(),
                'per_page' => $jobs->perPage(),
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
            ],
        ]);
    }

    public function createJob(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('data.exchange.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'job_type' => ['required', 'in:export,import,sync,transformation'],
            'source_system' => ['nullable', 'string', 'max:100'],
            'destination_system' => ['nullable', 'string', 'max:100'],
            'data_category' => ['required', 'in:patients,labs,billing,clinical'],
            'format' => ['sometimes', 'in:json,csv,hl7,fhir,xml'],
        ]);

        $job = DataExchangeJob::create(array_merge($validated, [
            'triggered_by' => $authUser->id,
            'status' => 'pending',
        ]));

        return response()->json([
            'data' => $job,
            'message' => 'Data exchange job queued.',
        ], 201);
    }

    public function updateJobStatus(Request $request, string $jobId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('data.exchange.manage')) {
            abort(403);
        }

        $job = DataExchangeJob::findOrFail($jobId);

        $validated = $request->validate([
            'status' => ['required', 'in:running,completed,failed'],
            'records_processed' => ['nullable', 'integer'],
            'records_succeeded' => ['nullable', 'integer'],
            'records_failed' => ['nullable', 'integer'],
            'error_log' => ['nullable', 'string'],
        ]);

        if ($validated['status'] === 'running') {
            $validated['started_at'] = now();
        } elseif (in_array($validated['status'], ['completed', 'failed'])) {
            $validated['completed_at'] = now();
        }

        $job->update($validated);

        return response()->json(['data' => $job->fresh(), 'message' => 'Job status updated.']);
    }
}
