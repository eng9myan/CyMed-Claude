<?php

namespace Modules\Radiology\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Radiology\Models\ImagingOrder;

class ImagingOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['radiology.orders.view', 'patients.view'])) {
            abort(403);
        }

        $orders = ImagingOrder::with(['patient:id,first_name,last_name,mrn', 'orderedBy:id,first_name,last_name'])
            ->when($request->patient_id, fn ($q, $v) => $q->where('patient_id', $v))
            ->when($request->encounter_id, fn ($q, $v) => $q->where('encounter_id', $v))
            ->when($request->modality, fn ($q, $v) => $q->where('modality', $v))
            ->when($request->worklist_status, fn ($q, $v) => $q->where('worklist_status', $v))
            ->orderByDesc('ordered_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('radiology.orders.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'encounter_id' => ['required', 'uuid', 'exists:encounters,id'],
            'priority' => ['nullable', 'in:stat,urgent,asap,routine'],
            'modality' => ['required', 'in:XR,CT,MRI,US,NM,PET,DEXA,Fluoro,Mammo,Angio'],
            'body_part' => ['required', 'string', 'max:50'],
            'laterality' => ['nullable', 'in:left,right,bilateral,na'],
            'procedure_code' => ['nullable', 'string', 'max:20'],
            'procedure_name' => ['required', 'string', 'max:255'],
            'clinical_indication' => ['required', 'string', 'max:500'],
            'contrast_required' => ['boolean'],
            'contrast_agent' => ['nullable', 'string', 'max:100'],
            'contrast_allergy_checked' => ['boolean'],
            'pregnancy_status' => ['nullable', 'in:unknown,not_pregnant,possibly_pregnant,pregnant'],
            'special_instructions' => ['nullable', 'string', 'max:500'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $validated['ordered_by'] = $authUser->id;
        $validated['ordered_at'] = now();
        $validated['order_number'] = ImagingOrder::generateOrderNumber();
        $validated['worklist_status'] = 'scheduled';
        $validated['priority'] ??= 'routine';

        $order = ImagingOrder::create($validated);

        return response()->json([
            'data' => $order->load(['patient:id,first_name,last_name,mrn', 'orderedBy:id,first_name,last_name']),
            'message' => 'Imaging order created.',
        ], 201);
    }

    public function show(Request $request, ImagingOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['radiology.orders.view', 'patients.view'])) {
            abort(403);
        }

        return response()->json([
            'data' => $order->load(['patient', 'orderedBy:id,first_name,last_name', 'radiologist:id,first_name,last_name']),
        ]);
    }

    public function update(Request $request, ImagingOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['radiology.orders.create', 'radiology.reports.create'])) {
            abort(403);
        }

        $validated = $request->validate([
            'worklist_status' => ['sometimes', 'in:scheduled,arrived,in_progress,completed,reported,cancelled'],
            'radiologist_id' => ['nullable', 'uuid', 'exists:users,id'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        if (($validated['worklist_status'] ?? null) === 'in_progress') {
            $validated['started_at'] = now();
        }
        if (($validated['worklist_status'] ?? null) === 'completed') {
            $validated['completed_at'] = now();
        }

        $order->update($validated);

        return response()->json(['data' => $order->fresh()]);
    }

    public function destroy(ImagingOrder $order): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('radiology.orders.create')) {
            abort(403);
        }

        if (! in_array($order->worklist_status, ['scheduled'])) {
            return response()->json(['message' => 'Only scheduled orders can be cancelled.'], 422);
        }

        $order->update(['worklist_status' => 'cancelled']);
        $order->delete();

        return response()->json(null, 204);
    }

    public function submitReport(Request $request, ImagingOrder $order): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('radiology.reports.create')) {
            abort(403);
        }

        if (! in_array($order->worklist_status, ['completed', 'reported'])) {
            return response()->json(['message' => 'Study must be completed before reporting.'], 422);
        }

        $validated = $request->validate([
            'findings' => ['required', 'string'],
            'impression' => ['required', 'string'],
            'recommendation' => ['nullable', 'string'],
            'report_status' => ['required', 'in:draft,preliminary,final'],
        ]);

        $validated['worklist_status'] = 'reported';
        $validated['radiologist_id'] = $authUser->id;

        if ($validated['report_status'] === 'final') {
            $validated['report_signed_at'] = now();
        }

        $order->update($validated);

        return response()->json([
            'data' => $order->fresh(),
            'message' => 'Report submitted.',
        ]);
    }
}
