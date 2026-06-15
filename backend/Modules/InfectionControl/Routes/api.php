<?php

use Illuminate\Support\Facades\Route;

// InfectionControl API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add InfectionControl specific API routes
});
