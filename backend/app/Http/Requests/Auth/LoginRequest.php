<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:200'],
            'device_type' => ['nullable', 'string', 'in:web,mobile_ios,mobile_android,desktop_app,api'],
            'remember' => ['nullable', 'boolean'],
        ];
    }
}
