<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Sekretaris\SuratController;
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

// ── Sekretaris ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:sekretaris'])
    ->prefix('sekretaris')
    ->name('sekretaris.')
    ->group(function () {
        // Resource surat: index, create, store, show
        Route::resource('surat', SuratController::class)
            ->only(['index', 'create', 'store', 'show']);

        // Preview PDF draft (stream file, protected)
        Route::get('surat/{surat}/preview', [SuratController::class, 'previewFile'])
            ->name('surat.preview');

        // Placement Editor Save
        Route::put('surat/{surat}/placement', [SuratController::class, 'updatePlacement'])
            ->name('surat.placement.update');

        // Ajukan surat ke approver
        Route::post('surat/{surat}/submit', [SuratController::class, 'submit'])
            ->name('surat.submit');
    });

