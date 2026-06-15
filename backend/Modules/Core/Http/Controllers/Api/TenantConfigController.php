<?php

namespace Modules\Core\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\FacilityFeatureFlag;
use Modules\Core\Models\FeatureFlag;
use Modules\Core\Models\TenantConfiguration;

class TenantConfigController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('tenant.config.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $config = TenantConfiguration::firstOrCreate(
            ['facility_id' => $validated['facility_id']],
            ['app_name' => 'CyMed', 'enabled_modules' => [], 'custom_fields' => []]
        );

        return response()->json(['data' => $config]);
    }

    public function update(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('tenant.config.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'primary_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'favicon_url' => ['nullable', 'string', 'max:500'],
            'app_name' => ['nullable', 'string', 'max:100'],
            'app_name_ar' => ['nullable', 'string', 'max:100'],
            'support_email' => ['nullable', 'email', 'max:150'],
            'support_phone' => ['nullable', 'string', 'max:30'],
            'enabled_modules' => ['nullable', 'array'],
            'custom_fields' => ['nullable', 'array'],
        ]);

        $facilityId = $validated['facility_id'];
        unset($validated['facility_id']);

        $config = TenantConfiguration::updateOrCreate(
            ['facility_id' => $facilityId],
            $validated
        );

        return response()->json([
            'data' => $config->fresh(),
            'message' => 'Tenant configuration updated.',
        ]);
    }

    public function featureFlags(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('tenant.config.view')) {
            abort(403);
        }

        $flags = FeatureFlag::orderBy('flag_name')->get();

        return response()->json(['data' => $flags]);
    }

    public function toggleFeatureFlag(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('tenant.config.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'feature_flag_id' => ['required', 'uuid', 'exists:feature_flags,id'],
            'is_enabled' => ['required', 'boolean'],
        ]);

        $flag = FacilityFeatureFlag::updateOrCreate(
            [
                'facility_id' => $validated['facility_id'],
                'feature_flag_id' => $validated['feature_flag_id'],
            ],
            ['is_enabled' => $validated['is_enabled']]
        );

        return response()->json([
            'data' => $flag->fresh(),
            'message' => 'Feature flag updated.',
        ]);
    }
}
