<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('super-admin') || $this->user()->hasRole('system-admin');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80', 'unique:roles,name', 'alpha_dash'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
