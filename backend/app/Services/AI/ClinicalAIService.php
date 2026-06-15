<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ClinicalAIService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://api.anthropic.com/v1';

    public function __construct(array $config)
    {
        $this->apiKey = env('ANTHROPIC_API_KEY', '');
        $this->model = $config['model'] ?? 'claude-opus-4-8';
    }

    public function checkDrugInteractions(array $currentMedications, array $newDrug): array
    {
        if (empty($this->apiKey)) {
            return $this->ruleBasedInteractionCheck($currentMedications, $newDrug);
        }

        $cacheKey = 'drug_interactions_' . md5(json_encode([$currentMedications, $newDrug]));
        return Cache::remember($cacheKey, 3600, function () use ($currentMedications, $newDrug) {
            try {
                $prompt = $this->buildDrugInteractionPrompt($currentMedications, $newDrug);
                $response = $this->callClaude($prompt, 1000);
                return $this->parseDrugInteractionResponse($response);
            } catch (\Exception $e) {
                Log::error('AI drug interaction check failed', ['error' => $e->getMessage()]);
                return $this->ruleBasedInteractionCheck($currentMedications, $newDrug);
            }
        });
    }

    public function generateDischargeSummary(array $encounter, array $clinicalData): string
    {
        if (empty($this->apiKey)) {
            return $this->templateDischargeSummary($encounter, $clinicalData);
        }

        try {
            $prompt = $this->buildDischargeSummaryPrompt($encounter, $clinicalData);
            return $this->callClaude($prompt, 2000);
        } catch (\Exception $e) {
            Log::error('AI discharge summary generation failed', ['error' => $e->getMessage()]);
            return $this->templateDischargeSummary($encounter, $clinicalData);
        }
    }

    public function suggestIcdCodes(string $clinicalText, int $maxResults = 5): array
    {
        if (empty($this->apiKey)) {
            return [];
        }

        $cacheKey = 'icd_suggest_' . md5($clinicalText);
        return Cache::remember($cacheKey, 1800, function () use ($clinicalText, $maxResults) {
            try {
                $prompt = "You are a medical coding expert. Based on the following clinical text, suggest the most appropriate ICD-11 codes. Return a JSON array with objects containing: code, display, confidence (0-1), category.\n\nClinical text: {$clinicalText}\n\nReturn only valid JSON, no other text.";
                $response = $this->callClaude($prompt, 500);
                $codes = json_decode($response, true) ?? [];
                return array_slice($codes, 0, $maxResults);
            } catch (\Exception $e) {
                Log::error('ICD code suggestion failed', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    public function calculateNews2Score(array $vitals): array
    {
        $score = 0;
        $details = [];

        // Respiratory Rate
        $rr = $vitals['respiratory_rate'] ?? null;
        if ($rr !== null) {
            if ($rr <= 8 || $rr >= 25) { $score += 3; $details['respiratory_rate'] = 3; }
            elseif ($rr >= 21) { $score += 2; $details['respiratory_rate'] = 2; }
            elseif ($rr <= 11 || ($rr >= 9 && $rr <= 11)) { $score += 1; $details['respiratory_rate'] = 1; }
            else { $details['respiratory_rate'] = 0; }
        }

        // Oxygen Saturation (Scale 1)
        $spo2 = $vitals['oxygen_saturation'] ?? null;
        if ($spo2 !== null) {
            if ($spo2 <= 91) { $score += 3; $details['oxygen_saturation'] = 3; }
            elseif ($spo2 <= 93) { $score += 2; $details['oxygen_saturation'] = 2; }
            elseif ($spo2 <= 95) { $score += 1; $details['oxygen_saturation'] = 1; }
            else { $details['oxygen_saturation'] = 0; }
        }

        // Systolic BP
        $sbp = $vitals['blood_pressure_systolic'] ?? null;
        if ($sbp !== null) {
            if ($sbp <= 90 || $sbp >= 220) { $score += 3; $details['systolic_bp'] = 3; }
            elseif ($sbp <= 100) { $score += 2; $details['systolic_bp'] = 2; }
            elseif ($sbp <= 110 || $sbp >= 111) { $score += 1; $details['systolic_bp'] = 1; }
            else { $details['systolic_bp'] = 0; }
        }

        // Heart Rate
        $hr = $vitals['heart_rate'] ?? null;
        if ($hr !== null) {
            if ($hr <= 40 || $hr >= 131) { $score += 3; $details['heart_rate'] = 3; }
            elseif ($hr >= 111) { $score += 2; $details['heart_rate'] = 2; }
            elseif ($hr <= 50 || $hr >= 91) { $score += 1; $details['heart_rate'] = 1; }
            else { $details['heart_rate'] = 0; }
        }

        // Temperature
        $temp = $vitals['temperature'] ?? null;
        if ($temp !== null) {
            if ($temp <= 35.0) { $score += 3; $details['temperature'] = 3; }
            elseif ($temp >= 39.1) { $score += 2; $details['temperature'] = 2; }
            elseif ($temp >= 38.1 || $temp <= 36.0) { $score += 1; $details['temperature'] = 1; }
            else { $details['temperature'] = 0; }
        }

        $risk = match(true) {
            $score >= 7 => 'high',
            $score >= 5 => 'medium',
            $score >= 3 => 'low_medium',
            default => 'low',
        };

        return [
            'score' => $score,
            'risk' => $risk,
            'details' => $details,
            'action' => $this->news2Action($risk),
        ];
    }

    private function news2Action(string $risk): string
    {
        return match($risk) {
            'high' => 'Urgent or emergency assessment — consider ICU/HDU transfer. Continuous monitoring.',
            'medium' => 'Urgent review by ward physician. Increase monitoring frequency.',
            'low_medium' => 'Prompt review by nurse. Increased monitoring.',
            default => 'Routine monitoring. Reassess per protocol.',
        };
    }

    private function callClaude(string $prompt, int $maxTokens = 1000): string
    {
        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->timeout(30)->post("{$this->baseUrl}/messages", [
            'model' => $this->model,
            'max_tokens' => $maxTokens,
            'system' => 'You are CyMed Clinical AI, an expert clinical decision support system. You provide evidence-based, accurate clinical information. Always note this is AI assistance - final decisions rest with the treating physician.',
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException("Claude API error: {$response->status()} - {$response->body()}");
        }

        return $response->json('content.0.text', '');
    }

    private function buildDrugInteractionPrompt(array $currentMedications, array $newDrug): string
    {
        $currentList = implode(', ', array_column($currentMedications, 'drug_name'));
        return "Check for clinically significant drug interactions between the NEW drug '{$newDrug['drug_name']}' ({$newDrug['dose']} {$newDrug['route']}) and the patient's CURRENT medications: {$currentList}.\n\nReturn JSON array of interactions: [{drug1, drug2, severity: contraindicated|major|moderate|minor, mechanism, clinical_effect, management, evidence_level}]. If no significant interactions, return empty array [].";
    }

    private function parseDrugInteractionResponse(string $response): array
    {
        preg_match('/\[.*\]/s', $response, $matches);
        if (empty($matches)) return [];
        return json_decode($matches[0], true) ?? [];
    }

    private function ruleBasedInteractionCheck(array $currentMedications, array $newDrug): array
    {
        return [];
    }

    private function buildDischargeSummaryPrompt(array $encounter, array $clinicalData): string
    {
        return "Generate a professional discharge summary based on this encounter data:\n\nPatient: {$clinicalData['patient_name']}, {$clinicalData['age']} year old {$clinicalData['gender']}\nAdmission Date: {$encounter['admitted_at']}\nDischarge Date: {$encounter['discharged_at']}\nAdmitting Diagnosis: {$encounter['primary_diagnosis_name']}\nAttending Physician: {$clinicalData['physician_name']}\n\nClinical Course:\n{$clinicalData['notes_summary']}\n\nLab Results:\n{$clinicalData['lab_summary']}\n\nMedications on Discharge:\n{$clinicalData['discharge_medications']}\n\nGenerate a structured discharge summary with sections: Reason for Admission, Hospital Course, Procedures, Significant Results, Discharge Condition, Discharge Instructions, Follow-up Plan, Discharge Medications.";
    }

    private function templateDischargeSummary(array $encounter, array $clinicalData): string
    {
        return "DISCHARGE SUMMARY\n\nPatient: {$clinicalData['patient_name']}\nMRN: {$clinicalData['mrn']}\nAdmission: {$encounter['admitted_at']}\nDischarge: {$encounter['discharged_at']}\nAttending: {$clinicalData['physician_name']}\n\nDiagnosis: {$encounter['primary_diagnosis_name']}\n\n[Please complete this discharge summary]";
    }
}
