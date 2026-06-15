<?php

use Illuminate\Support\Facades\Route;

// Admission API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Admission specific API routes
});
