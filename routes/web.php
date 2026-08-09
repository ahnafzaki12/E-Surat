<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

// Route untuk halaman login (hanya bisa diakses oleh tamu/guest)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

// Logout (harus login)
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Route yang dilindungi (harus login)
Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return Inertia\Inertia::render('Dashboard'); // Nantinya bisa diganti menjadi halaman dashboard Inertia
    })->name('dashboard');
});
