<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\PatientApiController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/tokens/revoke', [TokenController::class, 'revoke'])
        ->name('api.tokens.revoke');

    Route::middleware('zero.trust')->group(function () {
        Route::get('/patients', [PatientApiController::class, 'index']);
        Route::post('/patients', [PatientApiController::class, 'store']);
        Route::get('/patients/{patient}', [PatientApiController::class, 'show']);
        Route::put('/patients/{patient}', [PatientApiController::class, 'update']);
        Route::delete('/patients/{patient}', [PatientApiController::class, 'destroy']);
    });
});

Route::middleware('auth')->post('/tokens/create', [TokenController::class, 'store'])
    ->name('api.tokens.create');

