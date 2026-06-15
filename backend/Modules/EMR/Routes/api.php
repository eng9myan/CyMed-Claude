<?php

use Illuminate\Support\Facades\Route;

// EMR API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add EMR specific API routes
});
