<?php

use Illuminate\Support\Facades\Route;

// Radiology API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Radiology specific API routes
});
