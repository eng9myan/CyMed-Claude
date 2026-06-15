<?php

namespace App\Http\Requests\Facility;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('super-admin') || $this->user()->hasRole('system-admin');
    }

    public function rules(): array
    {
        return [
            'hospital_group_id' => ['nullable', 'uuid', 'exists:hospital_groups,id'],
            'parent_facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
            'name' => ['required', 'string', 'max:200'],
            'name_ar' => ['nullable', 'string', 'max:200'],
            'code' => ['required', 'string', 'max:30', 'unique:facilities,code'],
            'facility_type' => ['required', 'string', 'in:hospital,clinic,specialty_center,day_surgery,pharmacy,lab,diagnostic_center'],
            'city' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'size:2'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'bed_count' => ['nullable', 'integer', 'min:0'],
            'emergency_available' => ['nullable', 'boolean'],
            'icu_available' => ['nullable', 'boolean'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'vat_rate' => ['nullable', 'numeric', 'between:0,100'],
            'income_tax_rate' => ['nullable', 'numeric', 'between:0,100'],
            'insurance_claim_format' => ['nullable', 'string', 'in:generic,nphies,x12_837,hl7_fhir'],
            'currency' => ['nullable', 'string', 'size:3'],
            'timezone' => ['nullable', 'string', 'max:50'],
        ];
    }
}
