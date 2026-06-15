<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
            'department_id' => ['nullable', 'uuid', 'exists:departments,id'],
            'username' => ['nullable', 'string', 'max:50', "unique:users,username,{$userId}", 'alpha_dash'],
            'email' => ['nullable', 'email', 'max:150', "unique:users,email,{$userId}"],
            'first_name' => ['nullable', 'string', 'max:80'],
            'last_name' => ['nullable', 'string', 'max:80'],
            'first_name_ar' => ['nullable', 'string', 'max:80'],
            'last_name_ar' => ['nullable', 'string', 'max:80'],
            'user_type' => ['nullable', 'string', 'in:physician,resident,intern,consultant,nurse,charge_nurse,nursing_assistant,pharmacist,lab_technician,radiologist,billing_officer,insurance_coordinator,receptionist,hr_officer,quality_officer,system_admin,executive,patient'],
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
