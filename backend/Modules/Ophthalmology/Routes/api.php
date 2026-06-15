<?php

use Illuminate\Support\Facades\Route;

// Ophthalmology API Routes
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // Routes handled via main api.php
});
