<?php

use Illuminate\Support\Facades\Route;

// MedicalRecords API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add MedicalRecords specific API routes
});
