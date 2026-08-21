<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Sekretaris\SuratController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\JenisSuratController;
use App\Http\Controllers\LembagaController;
use App\Http\Controllers\ProfileController;
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
        // 1. Status counters
        $stats = [
            'disetujui' => \App\Models\Surat::where('status', 'disetujui')->count(),
            'menunggu_persetujuan' => \App\Models\Surat::where('status', 'menunggu_persetujuan')->count(),
            'draft' => \App\Models\Surat::where('status', 'draft')->count(),
            'ditolak' => \App\Models\Surat::where('status', 'ditolak')->count(),
        ];

        // 2. Surat Masuk Total & Monthly Trend (Jan..Aug of current year)
        $totalSuratMasuk = \App\Models\Surat::count();
        $currentYear = now()->year;

        $suratMasukMonthly = [];
        $suratDisetujuiMonthly = [];

        for ($m = 1; $m <= 8; $m++) {
            $suratMasukMonthly[] = \App\Models\Surat::whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $m)
                ->count();

            $suratDisetujuiMonthly[] = \App\Models\Surat::where('status', 'disetujui')
                ->whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $m)
                ->count();
        }

        // 3. Dynamic Lembaga Stats - Single Source of Truth from `lembagas` table
        $lembagas = \App\Models\Lembaga::orderBy('lemb_id')->get();
        $lembagaSeries = [];

        foreach ($lembagas as $lembaga) {
            $monthlyCounts = [];
            for ($m = 1; $m <= 8; $m++) {
                $count = \App\Models\Surat::whereYear('created_at', $currentYear)
                    ->whereMonth('created_at', $m)
                    ->whereHas('createdBy', function ($q) use ($lembaga) {
                        $q->where('lemb_id', $lembaga->lemb_id);
                    })->count();
                $monthlyCounts[] = $count;
            }
            $lembagaSeries[] = [
                'id' => $lembaga->lemb_id,
                'name' => $lembaga->lemb_name,
                'data' => $monthlyCounts,
            ];
        }

        // 4. Dynamic Jenis Surat Stats - Single Source of Truth from `jenis_surats` table
        $jenisSurats = \App\Models\JenisSurat::orderBy('id')->get();
        $jenisSuratSeries = [];

        foreach ($jenisSurats as $jenis) {
            $count = \App\Models\Surat::where('jenis_surat_id', $jenis->id)->count();
            $jenisSuratSeries[] = [
                'id' => $jenis->id,
                'kode' => $jenis->kode,
                'name' => $jenis->nama,
                'count' => $count,
            ];
        }

        return Inertia\Inertia::render('Dashboard', [
            'stats' => $stats,
            'suratMasuk' => [
                'total' => $totalSuratMasuk,
                'monthly_trend' => $suratMasukMonthly,
            ],
            'suratDisetujui' => [
                'total' => $stats['disetujui'],
                'monthly_trend' => $suratDisetujuiMonthly,
            ],
            'lembagaStats' => $lembagaSeries,
            'jenisSuratStats' => $jenisSuratSeries,
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

    // Profile (Pengaturan Akun)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
});
