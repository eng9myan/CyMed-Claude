<?php

use Illuminate\Support\Facades\Route;

// Dental API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Dental specific API routes
});
