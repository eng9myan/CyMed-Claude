<?php

use Illuminate\Support\Facades\Route;

// Inventory API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Inventory specific API routes
});
