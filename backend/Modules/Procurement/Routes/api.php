<?php

use Illuminate\Support\Facades\Route;

// Procurement API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Procurement specific API routes
});
