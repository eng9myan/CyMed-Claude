<?php

use Illuminate\Support\Facades\Route;

// Oncology API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Oncology routes - defined in main api.php
});
