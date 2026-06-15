<?php

use Illuminate\Support\Facades\Route;

// Cardiology API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Cardiology routes - defined in main api.php
});
