<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'full_name_ar' => $this->full_name_ar,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'first_name_ar' => $this->first_name_ar,
            'last_name_ar' => $this->last_name_ar,
            'employee_id' => $this->employee_id,
            'user_type' => $this->user_type,
            'job_title' => $this->job_title,
            'specialty' => $this->specialty,
            'subspecialty' => $this->subspecialty,
            'professional_license_number' => $this->professional_license_number,
            'license_expiry_date' => $this->license_expiry_date?->toDateString(),
            'scfhs_number' => $this->scfhs_number,
            'photo_path' => $this->photo_path,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'national_id' => $this->when($request->user()?->hasRole('super-admin'), $this->national_id),
            'locale' => $this->locale,
            'timezone' => $this->timezone,
            'is_rtl' => $this->is_rtl,
            'is_active' => $this->is_active,
            'mfa_enabled' => $this->mfa_enabled,
            'must_change_password' => $this->must_change_password,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'password_changed_at' => $this->password_changed_at?->toIso8601String(),
            'facility_id' => $this->facility_id,
            'facility' => $this->whenLoaded('facility', fn () => new FacilityResource($this->facility)),
            'department_id' => $this->department_id,
            'department' => $this->whenLoaded('department', fn () => new DepartmentResource($this->department)),
            'roles' => $this->whenLoaded('roles', fn () => $this->getRoleNames()),
            'permissions' => $this->when(
                $request->user()?->id === $this->id,
                fn () => $this->getAllPermissions()->pluck('name')
            ),
            'preferences' => $this->when($request->user()?->id === $this->id, $this->preferences),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
