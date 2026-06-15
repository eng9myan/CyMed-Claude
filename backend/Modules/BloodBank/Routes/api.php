<?php

use Illuminate\Support\Facades\Route;

// Blood Bank API Routes - loaded via main routes/api.php
Route::middleware(['auth:api', 'mfa'])->group(function () {
    // Routes are registered in main routes/api.php
});
