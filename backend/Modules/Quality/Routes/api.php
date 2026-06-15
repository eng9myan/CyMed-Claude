<?php

use Illuminate\Support\Facades\Route;

// Quality API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Quality specific API routes
});
