<?php

use Illuminate\Support\Facades\Route;

// Patient API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Patient specific API routes
});
