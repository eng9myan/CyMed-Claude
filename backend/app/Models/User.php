<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles, LogsActivity, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'facility_id', 'department_id', 'employee_id', 'username', 'email',
        'password', 'first_name', 'last_name', 'first_name_ar', 'last_name_ar',
        'display_name', 'date_of_birth', 'gender', 'national_id', 'nationality',
        'phone', 'mobile', 'job_title', 'specialty', 'subspecialty',
        'professional_license_number', 'license_expiry_date', 'scfhs_number',
        'npi', 'signature_image_path', 'photo_path', 'user_type',
        'is_active', 'locale', 'timezone', 'is_rtl', 'mfa_enabled',
        'preferences', 'notification_settings',
        'failed_login_attempts', 'is_locked', 'locked_until',
        'last_login_at', 'last_login_ip', 'must_change_password',
        'password_changed_at', 'mfa_secret', 'mfa_confirmed_at',
        'patient_id',
    ];

    protected $hidden = [
        'password', 'remember_token', 'mfa_secret', 'mfa_recovery_codes',
        'password_history',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'license_expiry_date' => 'date',
            'mfa_confirmed_at' => 'datetime',
            'locked_until' => 'datetime',
            'last_login_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_locked' => 'boolean',
            'is_rtl' => 'boolean',
            'mfa_enabled' => 'boolean',
            'must_change_password' => 'boolean',
            'preferences' => 'array',
            'notification_settings' => 'array',
            'password_history' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['email', 'first_name', 'last_name', 'user_type', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    // Relationships
    public function facility()
    {
        return $this->belongsTo(\Modules\Core\Models\Facility::class);
    }

    public function department()
    {
        return $this->belongsTo(\Modules\Core\Models\Department::class);
    }

    public function credentials()
    {
        return $this->hasMany(\Modules\HR\Models\StaffCredential::class);
    }

    public function workSchedules()
    {
        return $this->hasMany(\Modules\HR\Models\WorkSchedule::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(\Modules\HR\Models\LeaveRequest::class);
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    // Computed
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getFullNameArAttribute(): ?string
    {
        if ($this->first_name_ar || $this->last_name_ar) {
            return trim("{$this->first_name_ar} {$this->last_name_ar}");
        }
        return null;
    }

    public function getDefaultGuardName(): string
    {
        return 'web';
    }

    public function isPhysician(): bool
    {
        return in_array($this->user_type, ['physician', 'resident', 'intern', 'consultant']);
    }

    public function isNurse(): bool
    {
        return in_array($this->user_type, ['nurse', 'charge_nurse', 'nursing_assistant']);
    }

    public function incrementFailedLogin(): void
    {
        $this->increment('failed_login_attempts');
        if ($this->failed_login_attempts >= 5) {
            $this->update([
                'is_locked' => true,
                'locked_until' => now()->addMinutes(30),
            ]);
        }
    }

    public function resetFailedLogin(): void
    {
        $this->update([
            'failed_login_attempts' => 0,
            'is_locked' => false,
            'locked_until' => null,
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);
    }
}
