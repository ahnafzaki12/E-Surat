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
        $stats = [
            'disetujui' => \App\Models\Surat::where('status', 'disetujui')->count(),
            'menunggu_persetujuan' => \App\Models\Surat::where('status', 'menunggu_persetujuan')->count(),
            'draft' => \App\Models\Surat::where('status', 'draft')->count(),
            'ditolak' => \App\Models\Surat::where('status', 'ditolak')->count(),
        ];
        return Inertia\Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    })->name('dashboard');
});

// ── Surat ───────────────────────────────────────────────────────────────────
Route::middleware(['auth'])->group(function () {
    // Resource surat: index, create, store
    // surat.show digunakan sebagai JSON API endpoint oleh Index panel (bukan halaman terpisah)
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

    // Approve surat
    Route::post('surat/{surat}/approve', [SuratController::class, 'approve'])
        ->name('surat.approve');

    // Reject surat
    Route::post('surat/{surat}/reject', [SuratController::class, 'reject'])
        ->name('surat.reject');
});

