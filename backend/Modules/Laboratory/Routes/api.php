<?php

use Illuminate\Support\Facades\Route;

// Laboratory API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Laboratory specific API routes
});
