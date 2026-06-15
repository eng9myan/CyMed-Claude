<?php

use Illuminate\Support\Facades\Route;

// Pharmacy API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Pharmacy specific API routes
});
