<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FacilityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hospital_group_id' => $this->hospital_group_id,
            'parent_facility_id' => $this->parent_facility_id,
            'name' => $this->name,
            'name_ar' => $this->name_ar,
            'code' => $this->code,
            'facility_type' => $this->facility_type,
            'city' => $this->city,
            'region' => $this->region,
            'country' => $this->country,
            'phone' => $this->phone,
            'email' => $this->email,
            'bed_count' => $this->bed_count ?? 0,
            'emergency_available' => (bool) ($this->emergency_available ?? false),
            'icu_available' => (bool) ($this->icu_available ?? false),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'timezone' => $this->timezone,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
