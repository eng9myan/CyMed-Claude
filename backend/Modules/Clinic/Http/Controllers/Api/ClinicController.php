<?php

namespace Modules\Clinic\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Clinic\Models\Clinic;
use Modules\Clinic\Models\ClinicProvider;

class ClinicController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinics.view')) {
            abort(403);
        }

        $query = Clinic::query()->with(['facility:id,name,code']);

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('clinic_type')) {
            $query->where('clinic_type', $request->clinic_type);
        }

        $clinics = $query->orderBy('name')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $clinics->items(),
            'meta' => [
                'total' => $clinics->total(),
                'per_page' => $clinics->perPage(),
                'current_page' => $clinics->currentPage(),
                'last_page' => $clinics->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'clinic_code' => ['required', 'string', 'max:20', 'unique:clinics,clinic_code'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'name' => ['required', 'string', 'max:200'],
            'name_ar' => ['nullable', 'string', 'max:200'],
            'clinic_type' => ['required', 'in:general,specialist,dental,dermatology,ophthalmology,pediatrics,gynecology,psychiatry,physiotherapy,other'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'follow_up_fee' => ['nullable', 'numeric', 'min:0'],
            'operating_hours' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'max_daily_patients' => ['nullable', 'integer', 'min:1'],
        ]);

        $clinic = Clinic::create($validated);

        return response()->json([
            'data' => $clinic->load(['facility:id,name,code']),
            'message' => 'Clinic created successfully.',
        ], 201);
    }

    public function show(Clinic $clinic): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('clinics.view')) {
            abort(403);
        }

        $clinic->load([
            'facility:id,name,code',
            'providers.user:id,first_name,last_name,email',
        ]);

        return response()->json(['data' => $clinic]);
    }

    public function update(Request $request, Clinic $clinic): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:200'],
            'name_ar' => ['nullable', 'string', 'max:200'],
            'clinic_type' => ['sometimes', 'in:general,specialist,dental,dermatology,ophthalmology,pediatrics,gynecology,psychiatry,physiotherapy,other'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'follow_up_fee' => ['nullable', 'numeric', 'min:0'],
            'operating_hours' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'max_daily_patients' => ['nullable', 'integer', 'min:1'],
        ]);

        $clinic->update($validated);

        return response()->json([
            'data' => $clinic->fresh()->load(['facility:id,name,code']),
            'message' => 'Clinic updated successfully.',
        ]);
    }

    public function providers(Clinic $clinic): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('clinics.view')) {
            abort(403);
        }

        $providers = ClinicProvider::where('clinic_id', $clinic->id)
            ->with(['user:id,first_name,last_name,email'])
            ->get();

        return response()->json(['data' => $providers]);
    }

    public function addProvider(Request $request, Clinic $clinic): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('clinics.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $existing = ClinicProvider::where('clinic_id', $clinic->id)
            ->where('user_id', $validated['user_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'data' => $existing->load(['user:id,first_name,last_name,email']),
                'message' => 'Provider already attached to this clinic.',
            ]);
        }

        $provider = ClinicProvider::create([
            'clinic_id' => $clinic->id,
            'user_id' => $validated['user_id'],
            'is_primary' => $validated['is_primary'] ?? false,
        ]);

        return response()->json([
            'data' => $provider->load(['user:id,first_name,last_name,email']),
            'message' => 'Provider added to clinic.',
        ], 201);
    }
}
