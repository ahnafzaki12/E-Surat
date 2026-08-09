<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route untuk halaman login (hanya bisa diakses oleh tamu/guest)
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');
});

// Route yang dilindungi (harus login)
Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return view('welcome'); // Nantinya bisa diganti menjadi halaman dashboard Inertia
    })->name('dashboard');
});
