<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\User::class);
    }

    public function rules(): array
    {
        return [
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'department_id' => ['nullable', 'uuid', 'exists:departments,id'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username', 'alpha_dash'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'first_name_ar' => ['nullable', 'string', 'max:80'],
            'last_name_ar' => ['nullable', 'string', 'max:80'],
            'user_type' => ['required', 'string', 'in:physician,resident,intern,consultant,nurse,charge_nurse,nursing_assistant,pharmacist,lab_technician,radiologist,billing_officer,insurance_coordinator,receptionist,hr_officer,quality_officer,system_admin,executive,patient'],
            'job_title' => ['nullable', 'string', 'max:150'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'national_id' => ['nullable', 'string', 'max:30'],
            'phone' => ['nullable', 'string', 'max:30'],
            'mobile' => ['nullable', 'string', 'max:30'],
            'locale' => ['nullable', 'string', 'in:en,ar'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ];
    }
}
