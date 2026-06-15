<?php

use Illuminate\Support\Facades\Route;

// Finance API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Finance specific API routes
});
