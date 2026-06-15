<?php

use Illuminate\Support\Facades\Route;

// CareManagement API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add CareManagement specific API routes
});
