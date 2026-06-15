<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CyMed Platform Configuration
    |--------------------------------------------------------------------------
    */
    'version' => '1.0.0',
    'platform' => 'CyMed Healthcare ERP',
    
    'hospital' => [
        'name' => env('HOSPITAL_NAME', 'CyMed Medical Center'),
        'facility_id' => env('HOSPITAL_FACILITY_ID'),
        'license_number' => env('HOSPITAL_LICENSE_NUMBER'),
        'timezone' => env('HOSPITAL_TIMEZONE', 'Asia/Riyadh'),
        'currency' => env('HOSPITAL_CURRENCY', 'SAR'),
        'country' => env('HOSPITAL_COUNTRY', 'SA'),
    ],

    'fhir' => [
        'base_url' => env('FHIR_BASE_URL', '/fhir/r4'),
        'version' => env('FHIR_VERSION', 'R4'),
        'resources' => [
            'Patient', 'Encounter', 'Observation', 'Condition',
            'MedicationRequest', 'MedicationAdministration', 'AllergyIntolerance',
            'DiagnosticReport', 'ImagingStudy', 'Procedure', 'Immunization',
            'Coverage', 'Claim', 'ClaimResponse', 'ExplanationOfBenefit',
            'Appointment', 'Schedule', 'Slot', 'ServiceRequest',
            'Composition', 'DocumentReference', 'Bundle',
            'Organization', 'Practitioner', 'Location', 'Device', 'Medication',
            'FamilyMemberHistory', 'Task', 'CommunicationRequest', 'Invoice',
        ],
    ],

    'ai' => [
        'provider' => env('AI_PROVIDER', 'anthropic'),
        'model' => env('ANTHROPIC_MODEL', 'claude-opus-4-8'),
        'features' => [
            'drug_interaction_check' => true,
            'allergy_check' => true,
            'sepsis_alert' => true,
            'fall_risk' => true,
            'readmission_prediction' => true,
            'ambient_documentation' => true,
            'discharge_summary_ai' => true,
            'icd_code_suggestion' => true,
            'cpt_code_suggestion' => true,
            'differential_diagnosis' => true,
        ],
    ],

    'coding' => [
        'diagnosis' => 'ICD-11',
        'procedure' => 'CPT-4',
        'drug' => 'RxNorm',
        'lab' => 'LOINC',
        'clinical' => 'SNOMED-CT',
    ],

    'security' => [
        'mfa_enabled' => env('MFA_ENABLED', true),
        'session_timeout_minutes' => 30,
        'phi_encryption_key' => env('PHI_ENCRYPTION_KEY'),
        'audit_all_phi_access' => true,
        'break_glass_requires_justification' => true,
        'password_policy' => [
            'min_length' => 12,
            'require_uppercase' => true,
            'require_lowercase' => true,
            'require_number' => true,
            'require_special' => true,
            'history_count' => 12,
            'expiry_days' => 90,
        ],
    ],

    'triage' => [
        'system' => 'MTS', // Manchester Triage System
        'levels' => [
            1 => ['label' => 'Immediate',   'color' => 'red',    'max_wait_minutes' => 0],
            2 => ['label' => 'Very Urgent',  'color' => 'orange', 'max_wait_minutes' => 10],
            3 => ['label' => 'Urgent',       'color' => 'yellow', 'max_wait_minutes' => 60],
            4 => ['label' => 'Standard',     'color' => 'green',  'max_wait_minutes' => 120],
            5 => ['label' => 'Non-Urgent',   'color' => 'blue',   'max_wait_minutes' => 240],
        ],
    ],

    'mrn' => [
        'prefix' => 'CYM',
        'length' => 8,
        'format' => 'CYM-{YEAR}-{SEQ}',
    ],

    'locales' => [
        'supported' => ['en', 'ar'],
        'default' => 'en',
        'rtl' => ['ar'],
    ],

    'notifications' => [
        'channels' => ['database', 'mail', 'sms', 'whatsapp', 'push'],
        'critical_lab_channels' => ['database', 'sms', 'push'],
        'appointment_reminder_hours' => [24, 2],
    ],

    'modules' => [
        'patient', 'appointment', 'emr', 'nursing', 'emergency',
        'ambulance', 'admission', 'bed_management', 'icu', 'nicu',
        'operating_theater', 'pharmacy', 'laboratory', 'radiology',
        'physiotherapy', 'dental', 'dialysis', 'maternity', 'pediatrics',
        'billing', 'insurance', 'finance', 'procurement', 'inventory',
        'hr', 'payroll', 'quality', 'infection_control', 'medical_records',
        'coding', 'care_management', 'rpm', 'patient_portal',
    ],
];
