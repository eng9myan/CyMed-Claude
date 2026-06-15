<?php

namespace Modules\Core\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\LocaleTranslation;
use Modules\Core\Models\UserLocalePreference;

class LocalizationController extends Controller
{
    public function translations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'max:10'],
            'namespace' => ['sometimes', 'string', 'max:50'],
        ]);

        $query = LocaleTranslation::where('locale', $validated['locale']);

        if (isset($validated['namespace'])) {
            $query->where('namespace', $validated['namespace']);
        }

        $translations = $query->get()->keyBy(fn($t) => $t->namespace . '.' . $t->key)
            ->map(fn($t) => $t->value);

        return response()->json(['data' => $translations, 'locale' => $validated['locale']]);
    }

    public function storeTranslation(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('localization.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'locale' => ['required', 'string', 'max:10'],
            'namespace' => ['required', 'string', 'max:50'],
            'key' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string'],
        ]);

        $translation = LocaleTranslation::updateOrCreate(
            ['locale' => $validated['locale'], 'namespace' => $validated['namespace'], 'key' => $validated['key']],
            ['value' => $validated['value']]
        );

        return response()->json([
            'data' => $translation,
            'message' => 'Translation saved.',
        ], 201);
    }

    public function myPreferences(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $prefs = UserLocalePreference::firstOrCreate(
            ['user_id' => $authUser->id],
            ['locale' => 'ar']
        );

        return response()->json(['data' => $prefs]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'locale' => ['sometimes', 'string', 'in:en,ar,fr,tr,ur'],
            'date_format' => ['sometimes', 'string', 'max:20'],
            'time_format' => ['sometimes', 'in:12h,24h'],
            'calendar_type' => ['sometimes', 'in:gregorian,hijri'],
            'number_format' => ['sometimes', 'in:western,arabic-indic'],
        ]);

        $prefs = UserLocalePreference::updateOrCreate(
            ['user_id' => $authUser->id],
            $validated
        );

        return response()->json([
            'data' => $prefs->fresh(),
            'message' => 'Locale preferences updated.',
        ]);
    }
}
