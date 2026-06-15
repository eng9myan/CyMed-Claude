<?php

use Illuminate\Support\Facades\Route;

// BedManagement API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add BedManagement specific API routes
});
