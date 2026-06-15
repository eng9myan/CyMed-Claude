<?php

namespace App\Services\Nphies;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * NPHIES integration client — Saudi National Platform for Health Insurance Exchange Services.
 * Uses FHIR R4 bundles for claim submission, eligibility verification, and prior authorization.
 * Spec: https://HSB.nphies.sa/fhir/
 */
class NphiesService
{
    private const TOKEN_CACHE_KEY = 'nphies_access_token';
    private const TOKEN_ENDPOINT  = '/oauth2/token';

    private string $baseUrl;
    private string $payerId;
    private string $providerNpi;
    private string $clientId;
    private string $clientSecret;

    public function __construct()
    {
        $this->baseUrl      = rtrim(config('services.nphies.base_url', 'https://HSB.nphies.sa'), '/');
        $this->payerId      = config('services.nphies.payer_id', '');
        $this->providerNpi  = config('services.nphies.provider_npi', '');
        $this->clientId     = config('services.nphies.client_id', '');
        $this->clientSecret = config('services.nphies.client_secret', '');
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Verify insurance eligibility for a patient.
     *
     * @param  array{
     *   patient_id: string,
     *   patient_national_id: string,
     *   member_id: string,
     *   policy_number: string,
     *   insurer_id: string,
     *   service_date: string,
     *   coverage_type?: string,
     * } $data
     */
    public function checkEligibility(array $data): array
    {
        $requestId  = (string) Str::uuid();
        $bundleId   = (string) Str::uuid();
        $resourceId = (string) Str::uuid();

        $bundle = $this->buildEligibilityBundle($data, $requestId, $bundleId, $resourceId);

        $response = $this->post('/fhir/CoverageEligibilityRequest', $bundle);

        return $this->parseEligibilityResponse($response, $requestId);
    }

    /**
     * Submit a prior-authorization request to NPHIES.
     *
     * @param  array{
     *   claim_id: string,
     *   patient: array,
     *   encounter: array,
     *   insurer_id: string,
     *   items: array,
     *   total_amount: float,
     * } $data
     */
    public function submitPreAuthorization(array $data): array
    {
        $requestId = (string) Str::uuid();
        $bundle    = $this->buildClaimBundle($data, 'preauthorization', $requestId);

        $response = $this->post('/fhir/Claim', $bundle);

        return [
            'request_id'   => $requestId,
            'status'       => $response['resourceType'] === 'ClaimResponse' ? 'received' : 'pending',
            'reference'    => $response['id'] ?? null,
            'raw_response' => $response,
        ];
    }

    /**
     * Submit a claim to NPHIES.
     *
     * @param  array{
     *   claim_id: string,
     *   claim_number: string,
     *   patient: array,
     *   encounter: array,
     *   insurer_id: string,
     *   insurance: array,
     *   items: array,
     *   total_amount: float,
     *   claim_type: string,
     * } $data
     */
    public function submitClaim(array $data): array
    {
        $requestId = (string) Str::uuid();
        $bundle    = $this->buildClaimBundle($data, 'claim', $requestId);

        $response = $this->post('/fhir/Claim', $bundle);

        return [
            'request_id'          => $requestId,
            'status'              => 'submitted',
            'nphies_reference'    => $response['id'] ?? null,
            'submission_datetime' => now()->toIso8601String(),
            'raw_request'         => $bundle,
            'raw_response'        => $response,
        ];
    }

    /**
     * Poll claim status from NPHIES by reference ID.
     */
    public function getClaimStatus(string $nphiesReference): array
    {
        $response = $this->get("/fhir/ClaimResponse/{$nphiesReference}");

        return [
            'reference'    => $nphiesReference,
            'status'       => $response['outcome'] ?? 'unknown',
            'disposition'  => $response['disposition'] ?? null,
            'total'        => $response['total'] ?? [],
            'raw_response' => $response,
        ];
    }

    /**
     * Cancel a submitted claim.
     */
    public function cancelClaim(string $nphiesReference, string $reason): array
    {
        $payload = [
            'resourceType' => 'Task',
            'id'           => (string) Str::uuid(),
            'status'       => 'requested',
            'intent'       => 'proposal',
            'code'         => [
                'coding' => [
                    ['system' => 'http://hl7.org/fhir/CodeSystem/task-code', 'code' => 'cancel'],
                ],
            ],
            'focus' => [
                'reference' => "Claim/{$nphiesReference}",
            ],
            'note' => [
                ['text' => $reason],
            ],
        ];

        return $this->post('/fhir/Task', $payload);
    }

    // -------------------------------------------------------------------------
    // FHIR Bundle Builders
    // -------------------------------------------------------------------------

    private function buildEligibilityBundle(array $data, string $requestId, string $bundleId, string $resourceId): array
    {
        return [
            'resourceType' => 'Bundle',
            'id'           => $bundleId,
            'meta'         => [
                'profile' => ['http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/eligibility-request'],
            ],
            'type'      => 'message',
            'timestamp' => now()->toIso8601String(),
            'entry'     => [
                [
                    'fullUrl'  => "urn:uuid:{$bundleId}",
                    'resource' => $this->buildMessageHeader('eligibility-request', $requestId),
                ],
                [
                    'fullUrl'  => "urn:uuid:{$resourceId}",
                    'resource' => [
                        'resourceType' => 'CoverageEligibilityRequest',
                        'id'           => $resourceId,
                        'meta'         => [
                            'profile' => ['http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/eligibility-request'],
                        ],
                        'identifier' => [
                            [
                                'system' => "http://sgh.com.sa/identifier/eligibility/{$this->providerNpi}",
                                'value'  => $requestId,
                            ],
                        ],
                        'status'   => 'active',
                        'priority' => ['coding' => [['code' => 'normal']]],
                        'purpose'  => ['benefits'],
                        'patient'  => [
                            'identifier' => [
                                'system' => 'http://nphies.sa/identifier/iqama',
                                'value'  => $data['patient_national_id'],
                            ],
                        ],
                        'servicedDate' => $data['service_date'],
                        'created'      => now()->toIso8601String(),
                        'insurer'      => [
                            'identifier' => [
                                'system' => 'http://nphies.sa/license/payer-license',
                                'value'  => $data['insurer_id'],
                            ],
                        ],
                        'provider' => [
                            'identifier' => [
                                'system' => 'http://nphies.sa/license/provider-license',
                                'value'  => $this->providerNpi,
                            ],
                        ],
                        'insurance' => [
                            [
                                'focal'    => true,
                                'coverage' => [
                                    'identifier' => [
                                        'system' => 'http://pseudo-payer.com.sa/memberid',
                                        'value'  => $data['member_id'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function buildClaimBundle(array $data, string $use, string $requestId): array
    {
        $bundleId = (string) Str::uuid();
        $claimId  = (string) Str::uuid();

        return [
            'resourceType' => 'Bundle',
            'id'           => $bundleId,
            'meta'         => [
                'profile' => ["http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/{$use}"],
            ],
            'type'      => 'message',
            'timestamp' => now()->toIso8601String(),
            'entry'     => [
                [
                    'fullUrl'  => "urn:uuid:{$bundleId}",
                    'resource' => $this->buildMessageHeader($use, $requestId),
                ],
                [
                    'fullUrl'  => "urn:uuid:{$claimId}",
                    'resource' => $this->buildClaimResource($data, $use, $claimId),
                ],
            ],
        ];
    }

    private function buildClaimResource(array $data, string $use, string $claimId): array
    {
        $typeMap = [
            'professional'  => '837P',
            'institutional' => '837I',
            'pharmacy'      => 'pharmacy',
            'dental'        => 'oral',
        ];

        $claimType = $data['claim_type'] ?? 'professional';

        return [
            'resourceType' => 'Claim',
            'id'           => $claimId,
            'meta'         => [
                'profile' => ["http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/{$use}"],
            ],
            'identifier' => [
                [
                    'system' => "http://sgh.com.sa/identifier/claim/{$this->providerNpi}",
                    'value'  => $data['claim_number'] ?? $data['claim_id'],
                ],
            ],
            'status'  => 'active',
            'type'    => [
                'coding' => [
                    [
                        'system' => 'http://terminology.hl7.org/CodeSystem/claim-type',
                        'code'   => $typeMap[$claimType] ?? $claimType,
                    ],
                ],
            ],
            'use'     => $use,
            'patient' => [
                'identifier' => [
                    'system' => 'http://nphies.sa/identifier/iqama',
                    'value'  => $data['patient']['national_id'] ?? '',
                ],
            ],
            'created'  => now()->toIso8601String(),
            'insurer'  => [
                'identifier' => [
                    'system' => 'http://nphies.sa/license/payer-license',
                    'value'  => $data['insurer_id'],
                ],
            ],
            'provider' => [
                'identifier' => [
                    'system' => 'http://nphies.sa/license/provider-license',
                    'value'  => $this->providerNpi,
                ],
            ],
            'priority' => ['coding' => [['code' => 'normal']]],
            'insurance' => [
                [
                    'sequence'             => 1,
                    'focal'                => true,
                    'identifier'           => [
                        'system' => "http://sgh.com.sa/identifier/coverage/{$this->providerNpi}",
                        'value'  => $data['insurance']['policy_number'] ?? '',
                    ],
                    'coverage' => [
                        'identifier' => [
                            'system' => 'http://pseudo-payer.com.sa/memberid',
                            'value'  => $data['insurance']['member_id'] ?? '',
                        ],
                    ],
                ],
            ],
            'item'  => $this->buildClaimItems($data['items'] ?? []),
            'total' => [
                'value'    => (float) ($data['total_amount'] ?? 0),
                'currency' => 'SAR',
            ],
        ];
    }

    private function buildClaimItems(array $items): array
    {
        return array_values(array_map(function (array $item, int $idx) {
            return [
                'sequence'    => $idx + 1,
                'productOrService' => [
                    'coding' => [
                        [
                            'system' => 'http://nphies.sa/terminology/CodeSystem/scientific-codes',
                            'code'   => $item['code'] ?? '99213',
                            'display' => $item['description'] ?? '',
                        ],
                    ],
                ],
                'servicedDate' => $item['service_date'] ?? now()->toDateString(),
                'quantity'     => [
                    'value' => (float) ($item['quantity'] ?? 1),
                ],
                'unitPrice' => [
                    'value'    => (float) ($item['unit_price'] ?? 0),
                    'currency' => 'SAR',
                ],
                'net' => [
                    'value'    => (float) ($item['net'] ?? ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0)),
                    'currency' => 'SAR',
                ],
            ];
        }, $items, array_keys($items)));
    }

    private function buildMessageHeader(string $eventCode, string $requestId): array
    {
        return [
            'resourceType' => 'MessageHeader',
            'id'           => (string) Str::uuid(),
            'meta'         => [
                'profile' => ['http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/message-header'],
            ],
            'eventCoding' => [
                'system' => 'http://nphies.sa/terminology/CodeSystem/ksa-message-events',
                'code'   => $eventCode,
            ],
            'destination' => [
                [
                    'endpoint' => $this->baseUrl,
                    'receiver' => [
                        'identifier' => [
                            'system' => 'http://nphies.sa/license/payer-license',
                            'value'  => $this->payerId,
                        ],
                    ],
                ],
            ],
            'sender' => [
                'identifier' => [
                    'system' => 'http://nphies.sa/license/provider-license',
                    'value'  => $this->providerNpi,
                ],
            ],
            'source' => [
                'endpoint' => config('app.url'),
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // Response Parsers
    // -------------------------------------------------------------------------

    private function parseEligibilityResponse(array $response, string $requestId): array
    {
        $eligible  = false;
        $benefits  = [];
        $reference = null;

        if (isset($response['resourceType'])) {
            if ($response['resourceType'] === 'Bundle') {
                foreach ($response['entry'] ?? [] as $entry) {
                    $resource = $entry['resource'] ?? [];
                    if (($resource['resourceType'] ?? '') === 'CoverageEligibilityResponse') {
                        $eligible  = ($resource['outcome'] ?? '') !== 'error';
                        $benefits  = $resource['insurance'][0]['item'] ?? [];
                        $reference = $resource['id'] ?? null;
                        break;
                    }
                }
            } elseif ($response['resourceType'] === 'CoverageEligibilityResponse') {
                $eligible  = ($response['outcome'] ?? '') !== 'error';
                $benefits  = $response['insurance'][0]['item'] ?? [];
                $reference = $response['id'] ?? null;
            }
        }

        return [
            'eligible'     => $eligible,
            'request_id'   => $requestId,
            'reference'    => $reference,
            'benefits'     => $benefits,
            'checked_at'   => now()->toIso8601String(),
            'raw_response' => $response,
        ];
    }

    // -------------------------------------------------------------------------
    // HTTP Client
    // -------------------------------------------------------------------------

    private function client(): PendingRequest
    {
        return Http::withToken($this->getAccessToken())
            ->withHeaders([
                'Content-Type' => 'application/fhir+json',
                'Accept'       => 'application/fhir+json',
                'X-Request-ID' => (string) Str::uuid(),
            ])
            ->timeout(30)
            ->retry(3, 1000, fn ($e) => $e instanceof RequestException && $e->response->status() >= 500);
    }

    private function post(string $path, array $payload): array
    {
        try {
            $response = $this->client()->post($this->baseUrl . $path, $payload);
            $response->throw();

            return $response->json();
        } catch (RequestException $e) {
            Log::error('NPHIES request failed', [
                'path'   => $path,
                'status' => $e->response->status(),
                'body'   => $e->response->body(),
            ]);
            throw $e;
        }
    }

    private function get(string $path): array
    {
        try {
            $response = $this->client()->get($this->baseUrl . $path);
            $response->throw();

            return $response->json();
        } catch (RequestException $e) {
            Log::error('NPHIES GET failed', [
                'path'   => $path,
                'status' => $e->response->status(),
                'body'   => $e->response->body(),
            ]);
            throw $e;
        }
    }

    private function getAccessToken(): string
    {
        return Cache::remember(self::TOKEN_CACHE_KEY, 3300, function () {
            $response = Http::asForm()->post(
                $this->baseUrl . self::TOKEN_ENDPOINT,
                [
                    'grant_type'    => 'client_credentials',
                    'client_id'     => $this->clientId,
                    'client_secret' => $this->clientSecret,
                    'scope'         => 'openid',
                ]
            );

            $response->throw();

            return $response->json('access_token');
        });
    }
}
