<?php

use Illuminate\Support\Facades\Route;

// RPM API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add RPM specific API routes
});
