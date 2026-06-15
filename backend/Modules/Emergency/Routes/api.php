<?php

use Illuminate\Support\Facades\Route;

// Emergency API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // TODO: Add Emergency specific API routes
});
