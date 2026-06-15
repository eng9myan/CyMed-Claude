<?php

use Illuminate\Support\Facades\Route;

// HR API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add HR specific API routes
});
