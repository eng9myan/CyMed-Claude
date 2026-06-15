<?php

use Illuminate\Support\Facades\Route;

// Nursing API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Nursing specific API routes
});
