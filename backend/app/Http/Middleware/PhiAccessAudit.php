<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\Audit\AuditService;
use Symfony\Component\HttpFoundation\Response;

class PhiAccessAudit
{
    public function __construct(protected AuditService $auditService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response->isSuccessful() && $this->isPhiEndpoint($request)) {
            $this->auditService->logPhiAccess(
                $this->extractResourceType($request),
                $this->extractResourceId($request),
                $request->method() === 'GET' ? 'viewed' : 'modified',
            );
        }

        return $response;
    }

    private function isPhiEndpoint(Request $request): bool
    {
        $phiPrefixes = ['/api/patients', '/api/encounters', '/api/clinical', '/api/lab', '/api/imaging', '/fhir'];
        foreach ($phiPrefixes as $prefix) {
            if (str_starts_with($request->getPathInfo(), $prefix)) {
                return true;
            }
        }
        return false;
    }

    private function extractResourceType(Request $request): string
    {
        $segments = explode('/', trim($request->getPathInfo(), '/'));
        return $segments[1] ?? 'unknown';
    }

    private function extractResourceId(Request $request): string
    {
        $segments = explode('/', trim($request->getPathInfo(), '/'));
        return $segments[2] ?? 'collection';
    }
}
