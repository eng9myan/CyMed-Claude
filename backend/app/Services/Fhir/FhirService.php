<?php

namespace App\Services\Fhir;

use Illuminate\Support\Str;
use Carbon\Carbon;

class FhirService
{
    public function __construct(protected array $config) {}

    public function patientToFhir(array $patient): array
    {
        return [
            'resourceType' => 'Patient',
            'id' => $patient['id'],
            'meta' => [
                'versionId' => '1',
                'lastUpdated' => Carbon::parse($patient['updated_at'])->toIso8601String(),
                'profile' => ['http://hl7.org/fhir/StructureDefinition/Patient'],
            ],
            'identifier' => $this->buildPatientIdentifiers($patient),
            'active' => ! ($patient['deleted_at'] ?? false),
            'name' => $this->buildHumanNames($patient),
            'telecom' => $this->buildTelecom($patient),
            'gender' => $this->mapGender($patient['gender']),
            'birthDate' => $patient['date_of_birth'],
            'address' => $this->buildAddresses($patient['addresses'] ?? []),
            'communication' => [
                [
                    'language' => [
                        'coding' => [
                            ['system' => 'urn:ietf:bcp:47', 'code' => $patient['primary_language'] ?? 'ar'],
                        ],
                    ],
                    'preferred' => true,
                ],
            ],
            'maritalStatus' => $this->mapMaritalStatus($patient['marital_status'] ?? null),
            'deceasedBoolean' => $patient['is_deceased'] ?? false,
            'deceasedDateTime' => $patient['deceased_at'] ?? null,
        ];
    }

    public function encounterToFhir(array $encounter): array
    {
        return [
            'resourceType' => 'Encounter',
            'id' => $encounter['id'],
            'meta' => [
                'versionId' => '1',
                'lastUpdated' => Carbon::parse($encounter['updated_at'])->toIso8601String(),
            ],
            'identifier' => [
                [
                    'system' => 'urn:cymed:encounter',
                    'value' => $encounter['encounter_number'],
                ],
            ],
            'status' => $this->mapEncounterStatus($encounter['status']),
            'class' => $this->mapEncounterClass($encounter['encounter_type']),
            'type' => $encounter['admission_type'] ? [
                ['coding' => [['system' => 'http://terminology.hl7.org/CodeSystem/v2-0007', 'code' => $encounter['admission_type']]]],
            ] : null,
            'subject' => ['reference' => "Patient/{$encounter['patient_id']}"],
            'participant' => $this->buildEncounterParticipants($encounter),
            'period' => [
                'start' => $encounter['admitted_at'] ?? $encounter['arrived_at'],
                'end' => $encounter['discharged_at'] ?? null,
            ],
            'reasonCode' => $encounter['chief_complaint'] ? [
                ['text' => $encounter['chief_complaint']],
            ] : null,
            'diagnosis' => $this->buildEncounterDiagnoses($encounter),
            'hospitalization' => $encounter['encounter_type'] === 'inpatient' ? [
                'admitSource' => ['coding' => [['code' => $encounter['referral_source']]]],
                'dischargeDisposition' => $encounter['discharge_disposition'] ? [
                    'coding' => [['code' => $encounter['discharge_disposition']]],
                ] : null,
            ] : null,
            'location' => $encounter['department_id'] ? [
                ['location' => ['reference' => "Location/{$encounter['department_id']}"]],
            ] : null,
        ];
    }

    public function observationToFhir(array $vital, string $loincCode, string $display, $value, ?string $unit = null): array
    {
        return [
            'resourceType' => 'Observation',
            'id' => Str::uuid()->toString(),
            'status' => 'final',
            'category' => [
                [
                    'coding' => [
                        [
                            'system' => 'http://terminology.hl7.org/CodeSystem/observation-category',
                            'code' => 'vital-signs',
                            'display' => 'Vital Signs',
                        ],
                    ],
                ],
            ],
            'code' => [
                'coding' => [
                    [
                        'system' => 'http://loinc.org',
                        'code' => $loincCode,
                        'display' => $display,
                    ],
                ],
            ],
            'subject' => ['reference' => "Patient/{$vital['patient_id']}"],
            'encounter' => ['reference' => "Encounter/{$vital['encounter_id']}"],
            'effectiveDateTime' => Carbon::parse($vital['recorded_at'])->toIso8601String(),
            'valueQuantity' => $unit ? [
                'value' => $value,
                'unit' => $unit,
                'system' => 'http://unitsofmeasure.org',
                'code' => $unit,
            ] : null,
            'valueString' => $unit ? null : (string) $value,
            'performer' => [
                ['reference' => "Practitioner/{$vital['recorded_by']}"],
            ],
        ];
    }

    public function medicationRequestToFhir(array $order): array
    {
        return [
            'resourceType' => 'MedicationRequest',
            'id' => $order['id'],
            'status' => $this->mapMedicationStatus($order['status']),
            'intent' => 'order',
            'medicationCodeableConcept' => [
                'coding' => $order['rxnorm_code'] ? [
                    [
                        'system' => 'http://www.nlm.nih.gov/research/umls/rxnorm',
                        'code' => $order['rxnorm_code'],
                        'display' => $order['drug_name'],
                    ],
                ] : [],
                'text' => $order['drug_name'],
            ],
            'subject' => ['reference' => "Patient/{$order['patient_id']}"],
            'encounter' => ['reference' => "Encounter/{$order['encounter_id']}"],
            'authoredOn' => Carbon::parse($order['ordered_at'])->toIso8601String(),
            'requester' => ['reference' => "Practitioner/{$order['ordered_by']}"],
            'reasonCode' => $order['indication'] ? [['text' => $order['indication']]] : null,
            'dosageInstruction' => [
                [
                    'text' => $order['sig'],
                    'route' => [
                        'coding' => [
                            [
                                'system' => 'http://snomed.info/sct',
                                'display' => $order['route'],
                            ],
                        ],
                    ],
                    'doseAndRate' => [
                        [
                            'doseQuantity' => [
                                'value' => $order['dose'],
                                'unit' => $order['dose_unit'],
                            ],
                        ],
                    ],
                ],
            ],
            'dispenseRequest' => [
                'numberOfRepeatsAllowed' => $order['refills_allowed'] ?? 0,
                'quantity' => $order['quantity'] ? [
                    'value' => $order['quantity'],
                    'unit' => $order['quantity_unit'],
                ] : null,
            ],
        ];
    }

    public function vitalSignsBundle(array $vitalRecord): array
    {
        $observations = [];

        $mappings = [
            'heart_rate' => ['8867-4', 'Heart rate', 'heart_rate', '/min'],
            'blood_pressure_systolic' => ['8480-6', 'Systolic BP', 'blood_pressure_systolic', 'mm[Hg]'],
            'blood_pressure_diastolic' => ['8462-4', 'Diastolic BP', 'blood_pressure_diastolic', 'mm[Hg]'],
            'temperature' => ['8310-5', 'Body temperature', 'temperature', 'Cel'],
            'respiratory_rate' => ['9279-1', 'Respiratory rate', 'respiratory_rate', '/min'],
            'oxygen_saturation' => ['59408-5', 'Oxygen saturation', 'oxygen_saturation', '%'],
            'weight_kg' => ['29463-7', 'Body weight', 'weight_kg', 'kg'],
            'height_cm' => ['8302-2', 'Body height', 'height_cm', 'cm'],
            'pain_score' => ['72514-3', 'Pain severity', 'pain_score', '{score}'],
        ];

        foreach ($mappings as $field => [$loincCode, $display, $key, $unit]) {
            if (isset($vitalRecord[$key]) && $vitalRecord[$key] !== null) {
                $observations[] = $this->observationToFhir($vitalRecord, $loincCode, $display, $vitalRecord[$key], $unit);
            }
        }

        return [
            'resourceType' => 'Bundle',
            'type' => 'transaction',
            'entry' => array_map(fn($obs) => [
                'fullUrl' => "urn:uuid:{$obs['id']}",
                'resource' => $obs,
                'request' => ['method' => 'POST', 'url' => 'Observation'],
            ], $observations),
        ];
    }

    private function buildPatientIdentifiers(array $patient): array
    {
        $identifiers = [
            [
                'use' => 'usual',
                'system' => 'urn:cymed:mrn',
                'value' => $patient['mrn'],
            ],
        ];

        if ($patient['national_id'] ?? null) {
            $identifiers[] = [
                'system' => 'urn:sa:national-id',
                'value' => $patient['national_id'],
            ];
        }

        if ($patient['iqama_number'] ?? null) {
            $identifiers[] = [
                'system' => 'urn:sa:iqama',
                'value' => $patient['iqama_number'],
            ];
        }

        if ($patient['passport_number'] ?? null) {
            $identifiers[] = [
                'use' => 'official',
                'type' => ['coding' => [['system' => 'http://terminology.hl7.org/CodeSystem/v2-0203', 'code' => 'PPN']]],
                'value' => $patient['passport_number'],
            ];
        }

        return $identifiers;
    }

    private function buildHumanNames(array $patient): array
    {
        $names = [
            [
                'use' => 'official',
                'family' => $patient['last_name'],
                'given' => array_filter([$patient['first_name'], $patient['middle_name'] ?? null]),
                'text' => trim("{$patient['first_name']} " . (($patient['middle_name'] ?? null) ? "{$patient['middle_name']} " : '') . $patient['last_name']),
            ],
        ];

        if ($patient['first_name_ar'] ?? null) {
            $names[] = [
                'use' => 'nickname',
                'extension' => [
                    ['url' => 'http://hl7.org/fhir/StructureDefinition/language', 'valueCode' => 'ar'],
                ],
                'family' => $patient['last_name_ar'],
                'given' => array_filter([$patient['first_name_ar'], $patient['middle_name_ar'] ?? null]),
            ];
        }

        return $names;
    }

    private function buildTelecom(array $patient): array
    {
        $telecom = [];
        if ($patient['phone_primary'] ?? null) {
            $telecom[] = ['system' => 'phone', 'value' => $patient['phone_primary'], 'use' => 'home'];
        }
        if ($patient['phone_secondary'] ?? null) {
            $telecom[] = ['system' => 'phone', 'value' => $patient['phone_secondary'], 'use' => 'mobile'];
        }
        if ($patient['email'] ?? null) {
            $telecom[] = ['system' => 'email', 'value' => $patient['email']];
        }
        return $telecom;
    }

    private function buildAddresses(array $addresses): array
    {
        return array_map(fn($addr) => [
            'use' => $addr['type'] ?? 'home',
            'line' => [$addr['street'] ?? ''],
            'city' => $addr['city'] ?? null,
            'district' => $addr['region'] ?? null,
            'postalCode' => $addr['postal_code'] ?? null,
            'country' => $addr['country'] ?? 'SA',
        ], $addresses);
    }

    private function mapGender(?string $gender): string
    {
        return match($gender) {
            'M' => 'male',
            'F' => 'female',
            default => 'unknown',
        };
    }

    private function mapMaritalStatus(?string $status): ?array
    {
        if (! $status) return null;
        $codes = [
            'single' => 'S',
            'married' => 'M',
            'divorced' => 'D',
            'widowed' => 'W',
        ];
        $code = $codes[$status] ?? 'UNK';
        return ['coding' => [['system' => 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus', 'code' => $code]]];
    }

    private function mapEncounterStatus(string $status): string
    {
        return match($status) {
            'active' => 'in-progress',
            'finished' => 'finished',
            'cancelled' => 'cancelled',
            'on_hold' => 'onleave',
            default => 'unknown',
        };
    }

    private function mapEncounterClass(string $type): array
    {
        $classes = [
            'outpatient' => ['code' => 'AMB', 'display' => 'ambulatory'],
            'inpatient' => ['code' => 'IMP', 'display' => 'inpatient encounter'],
            'emergency' => ['code' => 'EMER', 'display' => 'emergency'],
            'observation' => ['code' => 'OBSENC', 'display' => 'observation encounter'],
        ];
        $class = $classes[$type] ?? ['code' => 'AMB', 'display' => 'ambulatory'];
        return [
            'system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            'code' => $class['code'],
            'display' => $class['display'],
        ];
    }

    private function mapMedicationStatus(string $status): string
    {
        return match($status) {
            'ordered', 'verified' => 'active',
            'dispensed', 'administered' => 'active',
            'discontinued' => 'stopped',
            'held' => 'on-hold',
            'completed' => 'completed',
            default => 'unknown',
        };
    }

    private function buildEncounterParticipants(array $encounter): array
    {
        $participants = [];
        if ($encounter['attending_physician_id'] ?? null) {
            $participants[] = [
                'type' => [['coding' => [['system' => 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', 'code' => 'ATND']]]],
                'individual' => ['reference' => "Practitioner/{$encounter['attending_physician_id']}"],
            ];
        }
        return $participants;
    }

    private function buildEncounterDiagnoses(array $encounter): array
    {
        $diagnoses = [];
        if ($encounter['primary_diagnosis_code'] ?? null) {
            $diagnoses[] = [
                'condition' => ['reference' => "Condition/{$encounter['id']}-primary"],
                'use' => ['coding' => [['system' => 'http://terminology.hl7.org/CodeSystem/diagnosis-role', 'code' => 'AD']]],
                'rank' => 1,
            ];
        }
        return $diagnoses;
    }
}
