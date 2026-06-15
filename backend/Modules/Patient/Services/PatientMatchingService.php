<?php

namespace Modules\Patient\Services;

use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Patient;

class PatientMatchingService
{
    public function findDuplicates(array $data, ?string $excludeId = null): array
    {
        $exactMatches = $this->findExactMatches($data, $excludeId);
        $fuzzyMatches = $this->findFuzzyMatches($data, $excludeId, $exactMatches->pluck('id')->all());

        return [
            'exact_matches' => $exactMatches->values(),
            'fuzzy_matches' => $fuzzyMatches->values(),
        ];
    }

    private function findExactMatches(array $data, ?string $excludeId): \Illuminate\Database\Eloquent\Collection
    {
        $query = Patient::active()->with(['facility']);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $query->where(function ($q) use ($data) {
            $hasIdentifier = false;

            if (! empty($data['national_id'])) {
                $q->orWhere('national_id', $data['national_id']);
                $hasIdentifier = true;
            }
            if (! empty($data['iqama_number'])) {
                $q->orWhere('iqama_number', $data['iqama_number']);
                $hasIdentifier = true;
            }
            if (! empty($data['passport_number'])) {
                $q->orWhere('passport_number', $data['passport_number']);
                $hasIdentifier = true;
            }

            if (! $hasIdentifier) {
                $q->whereRaw('1 = 0');
            }
        });

        return $query->get();
    }

    private function findFuzzyMatches(array $data, ?string $excludeId, array $excludeIds): \Illuminate\Database\Eloquent\Collection
    {
        if (empty($data['first_name']) || empty($data['last_name'])) {
            return collect();
        }

        $nameTerm = $data['first_name'] . ' ' . $data['last_name'];

        $query = Patient::active()
            ->with(['facility'])
            ->whereRaw("similarity(first_name || ' ' || last_name, ?) > 0.3", [$nameTerm]);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        if (! empty($excludeIds)) {
            $query->whereNotIn('id', $excludeIds);
        }

        if (! empty($data['date_of_birth'])) {
            $query->where('date_of_birth', $data['date_of_birth']);
        }

        return $query->orderByRaw("similarity(first_name || ' ' || last_name, ?) DESC", [$nameTerm])->limit(10)->get();
    }
}
