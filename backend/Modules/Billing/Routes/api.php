<?php

use Illuminate\Support\Facades\Route;

// Billing API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Billing specific API routes
});
