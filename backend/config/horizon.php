<?php

use Illuminate\Support\Str;

return [
    'domain' => null,
    'path' => 'horizon',
    'use' => 'default',
    'prefix' => env('HORIZON_PREFIX', 'horizon:'),
    'middleware' => ['web', 'auth', 'role:system-admin'],
    'waits' => ['redis:default' => 60],
    'trim' => [
        'recent' => 60,
        'pending' => 60,
        'completed' => 60,
        'recent_failed' => 10080,
        'failed' => 10080,
        'monitored' => 10080,
    ],
    'silenced' => [],
    'metrics' => [
        'trim_snapshots' => [
            'job' => 24,
            'queue' => 24,
        ],
    ],
    'fast_termination' => false,
    'memory_limit' => 64,
    'defaults' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses' => 1,
            'maxTime' => 0,
            'maxJobs' => 0,
            'memory' => 128,
            'tries' => 1,
            'timeout' => 60,
            'nice' => 0,
        ],
    ],
    'environments' => [
        'production' => [
            'supervisor-critical' => [
                'connection' => 'redis',
                'queue' => ['critical', 'lab-alerts', 'clinical-alerts'],
                'balance' => 'auto',
                'autoScalingStrategy' => 'time',
                'minProcesses' => 2,
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
                'tries' => 3,
                'timeout' => 30,
            ],
            'supervisor-high' => [
                'connection' => 'redis',
                'queue' => ['high', 'notifications', 'claims'],
                'balance' => 'auto',
                'minProcesses' => 2,
                'maxProcesses' => 8,
                'tries' => 3,
                'timeout' => 60,
            ],
            'supervisor-default' => [
                'connection' => 'redis',
                'queue' => ['default', 'reports', 'ai'],
                'balance' => 'auto',
                'minProcesses' => 1,
                'maxProcesses' => 5,
                'tries' => 3,
                'timeout' => 120,
            ],
        ],
        'local' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['default', 'critical', 'high', 'notifications', 'claims', 'reports', 'ai', 'lab-alerts', 'clinical-alerts'],
                'balance' => 'simple',
                'maxProcesses' => 3,
                'tries' => 3,
                'timeout' => 120,
            ],
        ],
    ],
];
