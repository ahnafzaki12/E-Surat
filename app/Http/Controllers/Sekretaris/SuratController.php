<?php

namespace App\Http\Controllers\Sekretaris;

use App\Http\Controllers\Controller;
use App\Models\ApprovalLog;
use App\Models\JenisSurat;
use App\Models\Surat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'surat'       => $surat,
                'previewUrl'  => route('surat.preview', $surat->id),
            ]);
        }

        return Inertia::render('Surat/Show', [
            'surat'       => $surat,
            'previewUrl'  => route('surat.preview', $surat->id),
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

        $fileDraft = $surat->file_draft;
        if (!$fileDraft || !isset($fileDraft['path'])) {
            abort(404, 'File draft tidak ditemukan.');
        }

        $path = $fileDraft['path'];

        if (!Storage::disk('private')->exists($path)) {
            abort(404, 'File tidak ada di storage.');
        }

        return response()->stream(function () use ($path) {
            echo Storage::disk('private')->get($path);
        }, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="preview.pdf"',
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
}
