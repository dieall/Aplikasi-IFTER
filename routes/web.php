<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\MfaController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified', 'mfa.verified'])->name('dashboard');

Route::middleware(['auth', 'mfa.verified', 'role:admin,doctor,nurse'])->group(function () {
    Route::resource('patients', PatientController::class);
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/mfa/challenge', [MfaController::class, 'show'])->name('mfa.challenge');
    Route::post('/mfa/verify', [MfaController::class, 'verify'])->name('mfa.verify');
    Route::post('/mfa/toggle', [MfaController::class, 'toggle'])->name('mfa.toggle');
});

require __DIR__.'/auth.php';
