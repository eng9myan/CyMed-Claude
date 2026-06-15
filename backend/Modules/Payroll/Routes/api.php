<?php

use Illuminate\Support\Facades\Route;

// Payroll API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Payroll specific API routes
});
