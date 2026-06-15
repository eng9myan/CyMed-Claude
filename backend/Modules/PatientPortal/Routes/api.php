<?php

use Illuminate\Support\Facades\Route;

// PatientPortal API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add PatientPortal specific API routes
});
