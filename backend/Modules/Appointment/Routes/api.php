<?php

use Illuminate\Support\Facades\Route;

// Appointment API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Appointment specific API routes
});
