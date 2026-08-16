<?php

namespace App\Http\Controllers\Sekretaris;

use App\Http\Controllers\Controller;
use App\Models\ApprovalLog;
use App\Models\JenisSurat;
use App\Models\NomorSurat;
use App\Models\Surat;
use App\Services\FinalSuratPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SuratController extends Controller
{
    /**
     * Daftar surat milik sekretaris yang sedang login.
     */
    public function index()
    {
        $query = Surat::with(['jenisSurat', 'createdBy', 'approvedBy']);

        $role = Auth::user()->role?->name;

        if ($role === 'sekretaris') {
            $query->where('created_by', Auth::id());
        } elseif ($role === 'approver') {
            $query->whereIn('status', ['menunggu_persetujuan', 'disetujui', 'ditolak']);
        }

        $surats = $query->latest()->paginate(10);

        return Inertia::render('Surat/Index', [
            'surats' => $surats,
        ]);
    }

    /**
     * Form upload surat baru.
     */
    public function create()
    {
        $jenisSurats = JenisSurat::orderBy('kode')->get(['id', 'kode', 'nama', 'kategori', 'qr_position_default']);

        return Inertia::render('Surat/Create', [
            'jenisSurats' => $jenisSurats,
        ]);
    }

    /**
     * Simpan surat baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_surat' => ['nullable', 'string', 'max:255'],
            'jenis_surat_id' => ['required', 'exists:jenis_surats,id'],
            'lembaga' => ['nullable', 'string', 'max:255'], // Placeholder for when ERD is updated
            'perihal' => ['required', 'string', 'max:255'],
            'tanggal_surat' => ['required', 'date'],
            'file_draft' => ['required', 'file', 'mimes:pdf', 'max:10240'], // max 10MB
            'qr_position' => ['nullable', 'array'],
            'qr_position.page' => ['required_with:qr_position', 'integer', 'min:1'],
            'qr_position.x' => ['required_with:qr_position', 'numeric', 'min:0', 'max:1'],
            'qr_position.y' => ['required_with:qr_position', 'numeric', 'min:0', 'max:1'],
            'qr_position.width' => ['required_with:qr_position', 'numeric', 'min:0', 'max:1'],
            'qr_position.height' => ['required_with:qr_position', 'numeric', 'min:0', 'max:1'],
        ]);

        $file = $request->file('file_draft');
        $originalName = $file->getClientOriginalName();
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
        $storagePath = $file->storeAs(
            'drafts/' . Auth::id(),
            $fileName,
            'private'
        );

        $surat = Surat::create([
            'nomor_surat_formatted' => $validated['nomor_surat'] ?? null,
            'jenis_surat_id' => $validated['jenis_surat_id'],
            'perihal' => $validated['perihal'],
            'tujuan_surat' => $validated['lembaga'] ?? '-',
            'tanggal_surat' => $validated['tanggal_surat'],
            'file_draft' => [
                'path' => $storagePath,
                'original_name' => $originalName,
                'size' => $file->getSize(),
                'mime' => 'application/pdf',
            ],
            'qr_position' => $validated['qr_position'] ?? null,
            'status' => 'menunggu_persetujuan',
            'created_by' => Auth::id(),
        ]);

        // Catat ke audit trail
        ApprovalLog::create([
            'surat_id' => $surat->id,
            'user_id' => Auth::id(),
            'aksi' => 'diajukan',
            'catatan' => null,
            'created_at' => now(),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Surat berhasil diajukan.');
    }

    /**
     * Detail surat milik sekretaris.
     */
    public function show(Request $request, string $id)
    {
        $query = Surat::with(['jenisSurat', 'approvalLogs.user']);

        $role = Auth::user()->role?->name;

        if ($role === 'sekretaris') {
            $query->where('created_by', Auth::id());
        } elseif ($role === 'approver') {
            $query->whereIn('status', ['menunggu_persetujuan', 'disetujui', 'ditolak']);
        }

        $surat = $query->findOrFail($id);

        // Always return JSON (used by Index panel via fetch)
        return response()->json([
            'surat'      => $surat,
            'previewUrl' => route('surat.preview', $surat->id),
        ]);
    }

    /**
     * Stream PDF draft untuk preview (protected, hanya pemilik surat).
     */
    public function previewFile(string $id)
    {
        $query = Surat::query();
        $role = Auth::user()->role?->name;

        if ($role === 'sekretaris') {
            $query->where('created_by', Auth::id());
        } elseif ($role === 'approver') {
            $query->whereIn('status', ['menunggu_persetujuan', 'disetujui', 'ditolak']);
        }

        $surat = $query->findOrFail($id);

        $file = $surat->status === 'disetujui' && $surat->file_final
            ? $surat->file_final
            : $surat->file_draft;
        if (!$file || !isset($file['path'])) {
            abort(404, 'File surat tidak ditemukan.');
        }

        $path = $file['path'];

        if (!Storage::disk('private')->exists($path)) {
            abort(404, 'File tidak ada di storage.');
        }

        return response()->stream(function () use ($path) {
            echo Storage::disk('private')->get($path);
        }, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . ($file['original_name'] ?? 'preview.pdf') . '"',
        ]);
    }

    /**
     * Ubah status surat dari draft ke menunggu_persetujuan.
     */
    public function submit(string $id)
    {
        $surat = Surat::where('created_by', Auth::id())
            ->whereIn('status', ['draft', 'ditolak'])
            ->findOrFail($id);

        $surat->update(['status' => 'menunggu_persetujuan']);

        // Catat ke audit trail
        ApprovalLog::create([
            'surat_id' => $surat->id,
            'user_id' => Auth::id(),
            'aksi' => 'diajukan',
            'catatan' => null,
            'created_at' => now(),
        ]);

        return redirect()
            ->route('surat.index', ['open' => $surat->id])
            ->with('success', 'Surat berhasil diajukan untuk persetujuan.');
    }
    /**
     * Simpan koordinat posisi QR Code.
     */
    public function updatePlacement(Request $request, string $id)
    {
        $surat = Surat::where('created_by', Auth::id())
            ->whereIn('status', ['draft', 'ditolak'])
            ->findOrFail($id);

        $validated = $request->validate([
            'page' => ['required', 'integer', 'min:1'],
            'x' => ['required', 'numeric', 'min:0', 'max:1'],
            'y' => ['required', 'numeric', 'min:0', 'max:1'],
            'width' => ['required', 'numeric', 'min:0', 'max:1'],
            'height' => ['required', 'numeric', 'min:0', 'max:1'],
        ]);

        $surat->update([
            'qr_position' => $validated,
        ]);

        return redirect()
            ->route('surat.index', ['open' => $surat->id])
            ->with('success', 'Posisi QR Code berhasil disimpan.');
    }

    /**
     * Setujui surat.
     */
    public function approve(string $id, FinalSuratPdfService $finalSuratPdfService)
    {
        abort_unless(strtolower((string) Auth::user()->role?->name) === 'approver', 403);

        try {
            DB::transaction(function () use ($id, $finalSuratPdfService) {
                $surat = Surat::with('jenisSurat')
                    ->where('status', 'menunggu_persetujuan')
                    ->lockForUpdate()
                    ->findOrFail($id);

                $nomorSurat = $surat->nomor_surat_formatted;
                $nomorSuratId = $surat->nomor_surat_id;

                if (!$nomorSurat) {
                    $year = (int) $surat->tanggal_surat->format('Y');
                    $counter = NomorSurat::where('jenis_surat_id', $surat->jenis_surat_id)
                        ->where('tahun', $year)
                        ->lockForUpdate()
                        ->first();

                    if (!$counter) {
                        $counter = NomorSurat::create([
                            'jenis_surat_id' => $surat->jenis_surat_id,
                            'tahun' => $year,
                            'last_number' => 0,
                        ]);
                    }

                    $counter->increment('last_number');
                    $sequence = $counter->fresh()->last_number;
                    $nomorSurat = $this->formatNomorSurat($surat->jenisSurat, $sequence, $surat->tanggal_surat);
                    $nomorSuratId = $counter->id;
                }

                $token = Str::random(48);

                $surat->update([
                    'nomor_surat_id' => $nomorSuratId,
                    'nomor_surat_formatted' => $nomorSurat,
                    'verification_token' => $token,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'catatan_penolakan' => null,
                ]);
                $surat->load('approvedBy');

                $fileFinal = $finalSuratPdfService->create($surat, route('surat.verify', $token));

                $surat->update([
                    'file_final' => $fileFinal,
                    'file_hash' => hash_file('sha256', Storage::disk('private')->path($fileFinal['path'])),
                    'status' => 'disetujui',
                ]);

                ApprovalLog::create([
                    'surat_id' => $surat->id,
                    'user_id' => Auth::id(),
                    'aksi' => 'disetujui',
                    'catatan' => null,
                    'created_at' => now(),
                ]);
            });
        } catch (\Throwable $exception) {
            report($exception);

            return back()->with('error', 'Surat gagal disetujui. PDF final tidak dapat dibuat.');
        }

        return redirect()
            ->route('surat.index')
            ->with('success', 'Surat berhasil disetujui dan PDF final telah dibuat.');
    }

    /** Halaman verifikasi publik dari QR Code. */
    public function verify(string $token)
    {
        $surat = Surat::with(['jenisSurat', 'approvedBy'])
            ->where('verification_token', $token)
            ->where('status', 'disetujui')
            ->firstOrFail();

        return Inertia::render('Surat/Verify', [
            'surat' => [
                'nomor_surat_formatted' => $surat->nomor_surat_formatted,
                'perihal' => $surat->perihal,
                'tujuan_surat' => $surat->tujuan_surat,
                'jenis_surat' => $surat->jenisSurat?->nama,
                'approved_by' => $surat->approvedBy?->name,
                'approved_at' => $surat->approved_at?->toIso8601String(),
                'file_hash' => $surat->file_hash,
                'download_url' => route('surat.verify.download', $surat->verification_token),
            ],
        ]);
    }

    /** Unduh PDF final melalui token verifikasi publik. */
    public function downloadFinal(string $token)
    {
        $surat = Surat::where('verification_token', $token)
            ->where('status', 'disetujui')
            ->firstOrFail();
        $file = $surat->file_final;

        abort_unless(isset($file['path']) && Storage::disk('private')->exists($file['path']), 404);

        return response()->download(
            Storage::disk('private')->path($file['path']),
            $file['original_name'] ?? 'surat-final.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    private function formatNomorSurat(JenisSurat $jenisSurat, int $sequence, \Carbon\CarbonInterface $tanggalSurat): string
    {
        $month = $jenisSurat->pakai_bulan_romawi
            ? $this->romanMonth((int) $tanggalSurat->format('n'))
            : $tanggalSurat->format('m');

        return "{$jenisSurat->kode}-{$sequence}/YA-PISSYA/{$month}/{$tanggalSurat->format('Y')}";
    }

    private function romanMonth(int $month): string
    {
        return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][$month];
    }

    /**
     * Tolak surat dengan catatan.
     */
    public function reject(Request $request, string $id)
    {
        $validated = $request->validate([
            'catatan_penolakan' => ['required', 'string', 'max:1000'],
        ]);

        $surat = Surat::whereIn('status', ['menunggu_persetujuan'])
            ->findOrFail($id);

        $surat->update([
            'status' => 'ditolak',
            'catatan_penolakan' => $validated['catatan_penolakan'],
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        ApprovalLog::create([
            'surat_id' => $surat->id,
            'user_id' => Auth::id(),
            'aksi' => 'ditolak',
            'catatan' => $validated['catatan_penolakan'],
            'created_at' => now(),
        ]);

        return redirect()
            ->route('surat.index', ['open' => $surat->id])
            ->with('success', 'Surat telah ditolak.');
    }
}
