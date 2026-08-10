import { router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface JenisSurat {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    qr_position_default: object | null;
}

interface PageProps {
    auth: { user: { id: number; name: string; email: string; role?: { name: string } } };
    jenisSurats: JenisSurat[];
    errors?: Record<string, string>;
    [key: string]: unknown;
}

type FormData = {
    nomor_surat: string;
    jenis_surat_id: string;
    lembaga: string;
    perihal: string;
    tanggal_surat: string;
    file_draft: File | null;
};

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{message}</p>;
}

export default function SuratCreate() {
    const { auth, jenisSurats } = usePage<PageProps>().props;
    const user = auth?.user;

    const { data, setData, post, processing, errors } = useForm<FormData>({
        nomor_surat: '',
        jenis_surat_id: '',
        lembaga: '',
        perihal: '',
        tanggal_surat: '',
        file_draft: null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewFileName, setPreviewFileName] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);

    const handleLogout = () => router.post(route('logout'));

    const setFile = (file: File | null) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diizinkan.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran file tidak boleh melebihi 10 MB.');
            return;
        }
        setData('file_draft', file);
        setPreviewFileName(file.name);
        setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        setFile(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sekretaris.surat.store'), {
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)' }}>
            {/* ── Navbar ── */}
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.visit(route('sekretaris.surat.index'))}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-base font-bold text-gray-900">Upload Surat Baru</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-xs text-indigo-500 capitalize">{user?.role?.name ?? 'User'}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all duration-150"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                    <button onClick={() => router.visit(route('sekretaris.surat.index'))} className="hover:text-indigo-600 transition">
                        Daftar Surat
                    </button>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="text-gray-600 font-medium">Upload Surat Baru</span>
                </nav>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                    {/* ── Card 1: Upload PDF ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                    1
                                </div>
                                <h2 className="font-semibold text-gray-800">Upload File PDF</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Drop zone */}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${isDragging
                                        ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                                        : previewFileName
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                id="drop-zone-pdf"
                            >
                                <input
                                    ref={fileInputRef}
                                    id="input-file-draft"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                />
                                {previewFileName ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-emerald-700 text-sm">{previewFileName}</p>
                                        <p className="text-xs text-emerald-500">{fileSize} · Klik untuk ganti file</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700 text-sm">Drag & drop file PDF di sini</p>
                                            <p className="text-xs text-gray-400 mt-0.5">atau klik untuk memilih file · Maks. 10 MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <FieldError message={errors.file_draft} />
                        </div>
                    </div>

                    {/* ── Card 2: Metadata ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                    2
                                </div>
                                <h2 className="font-semibold text-gray-800">Metadata Surat</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Nomor Surat */}
                            <div>
                                <label htmlFor="nomor_surat" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Nomor Surat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nomor_surat"
                                    type="text"
                                    value={data.nomor_surat}
                                    onChange={(e) => setData('nomor_surat', e.target.value)}
                                    placeholder="Contoh: 59/YA-PISSYA/VII/2026"
                                    maxLength={255}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                                />
                                <FieldError message={errors.nomor_surat} />
                            </div>

                            {/* Jenis Surat */}
                            <div>
                                <label htmlFor="jenis_surat_id" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Jenis Surat <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="jenis_surat_id"
                                    value={data.jenis_surat_id}
                                    onChange={(e) => setData('jenis_surat_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                                >
                                    <option value="">— Pilih jenis surat —</option>
                                    {jenisSurats.map((js) => (
                                        <option key={js.id} value={js.id}>
                                            [{js.kode}] {js.nama}
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={errors.jenis_surat_id} />
                            </div>

                            {/* Lembaga */}
                            <div>
                                <label htmlFor="lembaga" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Lembaga <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="lembaga"
                                    type="text"
                                    value={data.lembaga}
                                    onChange={(e) => setData('lembaga', e.target.value)}
                                    placeholder="Contoh: YAYASAN PONDOK PESANTREN ISLAMIYAH SYAFI'IYAH"
                                    maxLength={255}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                                />
                                <FieldError message={errors.lembaga} />
                            </div>

                            {/* Perihal */}
                            <div>
                                <label htmlFor="perihal" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Perihal <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="perihal"
                                    type="text"
                                    value={data.perihal}
                                    onChange={(e) => setData('perihal', e.target.value)}
                                    placeholder="Contoh: Undangan Rapat Koordinasi"
                                    maxLength={255}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                                />
                                <FieldError message={errors.perihal} />
                            </div>

                            {/* Tanggal Surat */}
                            <div>
                                <label htmlFor="tanggal_surat" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Tanggal Surat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="tanggal_surat"
                                    type="date"
                                    value={data.tanggal_surat}
                                    onChange={(e) => setData('tanggal_surat', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                                />
                                <FieldError message={errors.tanggal_surat} />
                            </div>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit(route('sekretaris.surat.index'))}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Batal
                        </button>
                        <button
                            id="btn-simpan-draft"
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                        >
                            {processing ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                    </svg>
                                    Simpan sebagai Draft
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}