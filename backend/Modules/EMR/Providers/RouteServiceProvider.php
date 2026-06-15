<?php

namespace Modules\EMR\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'EMR';
    protected string $moduleNameLower = 'emr';
    public const HOME = '/dashboard';

    public function boot(): void
    {
        parent::boot();
    }

    public function map(): void
    {
        $this->mapApiRoutes();
        $this->mapWebRoutes();
    }

    protected function mapWebRoutes(): void
    {
        Route::middleware('web')
            ->prefix($this->moduleNameLower)
            ->name($this->moduleNameLower . '.')
            ->group(module_path($this->moduleName, '/Routes/web.php'));
    }

    protected function mapApiRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api/v1')
            ->name('api.')
            ->group(module_path($this->moduleName, '/Routes/api.php'));
    }
}
