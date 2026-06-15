<?php

namespace Modules\PACS\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\PACS\Models\DicomStudy;
use Modules\PACS\Models\DicomSeries;

class PacsController extends Controller
{
    public function studies(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pacs.view')) {
            abort(403);
        }

        $query = DicomStudy::with(['patient:id,first_name,last_name,mrn']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('modality')) {
            $query->where('modality', $request->modality);
        }

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('study_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('study_date', '<=', $request->date_to);
        }

        $studies = $query->orderByDesc('study_date')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $studies->items(),
            'meta' => [
                'total' => $studies->total(),
                'per_page' => $studies->perPage(),
                'current_page' => $studies->currentPage(),
                'last_page' => $studies->lastPage(),
            ],
        ]);
    }

    public function registerStudy(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pacs.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'study_instance_uid' => ['required', 'string', 'max:100', 'unique:dicom_studies,study_instance_uid'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'accession_number' => ['nullable', 'string', 'max:50'],
            'modality' => ['required', 'in:CR,CT,MR,US,MG,NM,PT,XA,DX,RF,OT'],
            'body_part' => ['nullable', 'string', 'max:100'],
            'study_date' => ['required', 'date_format:Y-m-d H:i:s'],
            'description' => ['nullable', 'string', 'max:300'],
        ]);

        $study = DicomStudy::create(array_merge($validated, [
            'ordered_by' => $authUser->id,
            'status' => 'received',
        ]));

        return response()->json([
            'data' => $study->load('patient:id,first_name,last_name,mrn'),
            'message' => 'DICOM study registered.',
        ], 201);
    }

    public function showStudy(DicomStudy $dicomStudy): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('pacs.view')) {
            abort(403);
        }

        return response()->json([
            'data' => $dicomStudy->load([
                'patient:id,first_name,last_name,mrn',
                'series',
                'orderedBy:id,first_name,last_name',
            ]),
        ]);
    }

    public function addSeries(Request $request, DicomStudy $dicomStudy): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pacs.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'series_instance_uid' => ['required', 'string', 'max:100', 'unique:dicom_series,series_instance_uid'],
            'series_number' => ['nullable', 'integer'],
            'series_description' => ['nullable', 'string', 'max:200'],
            'modality' => ['required', 'in:CR,CT,MR,US,MG,NM,PT,XA,DX,RF,OT'],
            'instance_count' => ['nullable', 'integer', 'min:1'],
            'body_part' => ['nullable', 'string', 'max:100'],
        ]);

        $series = DicomSeries::create(array_merge($validated, [
            'dicom_study_id' => $dicomStudy->id,
        ]));

        $dicomStudy->increment('series_count');
        $dicomStudy->increment('instance_count', (int) ($validated['instance_count'] ?? 1));

        return response()->json([
            'data' => $series,
            'message' => 'Series added to study.',
        ], 201);
    }

    public function updateStatus(Request $request, DicomStudy $dicomStudy): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pacs.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:received,reported,verified'],
        ]);

        $dicomStudy->update(['status' => $validated['status']]);

        return response()->json([
            'data' => $dicomStudy->fresh(),
            'message' => 'Study status updated.',
        ]);
    }

    public function patientStudies(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('pacs.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
        ]);

        $studies = DicomStudy::where('patient_id', $validated['patient_id'])
            ->with(['series'])
            ->orderByDesc('study_date')
            ->get();

        return response()->json(['data' => $studies]);
    }
}
