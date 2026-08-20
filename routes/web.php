<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Sekretaris\SuratController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\JenisSuratController;
use App\Http\Controllers\LembagaController;
use Illuminate\Support\Facades\Route;

// Verifikasi dan unduhan dokumen final bersifat publik; token tidak memuat ID surat.
Route::get('/verify/{token}', [SuratController::class, 'verify'])->name('surat.verify');
Route::get('/verify/{token}/download', [SuratController::class, 'downloadFinal'])->name('surat.verify.download');

// Route untuk halaman login (hanya bisa diakses oleh tamu/guest)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

// Logout (harus login)
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Route yang dilindungi (harus login)
Route::middleware(['auth', 'permission:dashboard.view'])->group(function () {
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
    // Surat Resource Routes (dipecah agar bisa diberi middleware per method)
    Route::get('surat', [SuratController::class, 'index'])->name('surat.index')->middleware('permission:surat.index');
    Route::get('surat/create', [SuratController::class, 'create'])->name('surat.create')->middleware('permission:surat.create');
    Route::post('surat', [SuratController::class, 'store'])->name('surat.store')->middleware('permission:surat.create');
    Route::get('surat/{surat}', [SuratController::class, 'show'])->name('surat.show')->middleware('permission:surat.show');

    // System Setting Routes
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('classifications', JenisSuratController::class);
    Route::resource('stations', LembagaController::class);

    // Preview PDF draft (stream file, protected)
    Route::get('surat/{surat}/preview', [SuratController::class, 'previewFile'])
        ->name('surat.preview')->middleware('permission:surat.preview');

    // Placement Editor Save
    Route::put('surat/{surat}/placement', [SuratController::class, 'updatePlacement'])
        ->name('surat.placement.update')->middleware('permission:surat.placement');

    // Ajukan surat ke approver
    Route::post('surat/{surat}/submit', [SuratController::class, 'submit'])
        ->name('surat.submit')->middleware('permission:surat.submit');

    // Approve surat
    Route::post('surat/{surat}/approve', [SuratController::class, 'approve'])
        ->name('surat.approve')->middleware('permission:surat.approve');

    // Reject surat
    Route::post('surat/{surat}/reject', [SuratController::class, 'reject'])
        ->name('surat.reject')->middleware('permission:surat.approve');

    // Ganti file draft surat yang ditolak
    Route::post('surat/{surat}/replace-file', [SuratController::class, 'replaceFileDraft'])
        ->name('surat.replace-file')->middleware('permission:surat.replace-file');
});
