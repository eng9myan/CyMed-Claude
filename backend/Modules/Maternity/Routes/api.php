<?php

use Illuminate\Support\Facades\Route;

// Maternity API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Maternity specific API routes
});
