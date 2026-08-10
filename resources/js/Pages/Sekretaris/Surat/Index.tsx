import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface JenisSurat {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
}

interface Surat {
    id: number;
    perihal: string;
    tujuan_surat: string;
    tanggal_surat: string;
    status: string;
    jenis_surat: JenisSurat | null;
    created_at: string;
}

interface PaginatedSurats {
    data: Surat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    auth: { user: { id: number; name: string; email: string; role?: { name: string } } };
    surats: PaginatedSurats;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
    draft: {
        label: 'Draft',
        classes: 'bg-gray-100 text-gray-700 border border-gray-200',
        dot: 'bg-gray-400',
    },
    menunggu_persetujuan: {
        label: 'Menunggu Persetujuan',
        classes: 'bg-amber-50 text-amber-700 border border-amber-200',
        dot: 'bg-amber-400',
    },
    ditolak: {
        label: 'Ditolak',
        classes: 'bg-red-50 text-red-700 border border-red-200',
        dot: 'bg-red-500',
    },
    disetujui: {
        label: 'Disetujui',
        classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        dot: 'bg-emerald-500',
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        classes: 'bg-gray-100 text-gray-600 border border-gray-200',
        dot: 'bg-gray-400',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function SuratIndex() {
    const { auth, surats, flash } = usePage<PageProps>().props;
    const user = auth?.user;
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => router.post(route('logout'));

    const filteredSurats = surats.data.filter(
        (s) =>
            s.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.jenis_surat?.nama ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)' }}>
            {/* ── Navbar ── */}
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-base font-bold text-gray-900">E-Surat</span>
                                <span className="ml-2 text-xs text-gray-400 hidden sm:inline">Yayasan PISSYA</span>
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
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ── Flash message ── */}
                {flash?.success && (
                    <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Surat</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Kelola surat-surat yang Anda buat</p>
                    </div>
                    <button
                        id="btn-upload-surat-baru"
                        onClick={() => router.visit(route('sekretaris.surat.create'))}
                        className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Upload Surat Baru
                    </button>
                </div>

                {/* ── Stats strip ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total Surat', value: surats.total, icon: '📄', color: '#4f46e5' },
                        { label: 'Menunggu', value: surats.data.filter(s => s.status === 'menunggu_persetujuan').length, icon: '⏳', color: '#d97706' },
                        { label: 'Disetujui', value: surats.data.filter(s => s.status === 'disetujui').length, icon: '✅', color: '#059669' },
                        { label: 'Ditolak', value: surats.data.filter(s => s.status === 'ditolak').length, icon: '❌', color: '#dc2626' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Search ── */}
                <div className="relative mb-4">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        id="search-surat"
                        type="text"
                        placeholder="Cari perihal atau jenis surat…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                    />
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {filteredSurats.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-gray-700">Belum ada surat</p>
                            <p className="text-sm text-gray-400 mt-1">Mulai dengan mengupload surat baru</p>
                            <button
                                onClick={() => router.visit(route('sekretaris.surat.create'))}
                                className="mt-4 text-sm font-semibold text-white px-4 py-2 rounded-xl shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                            >
                                Upload Surat Baru
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/70">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">No.</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis Surat</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Perihal</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Tanggal</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredSurats.map((surat, idx) => (
                                        <tr
                                            key={surat.id}
                                            className="hover:bg-indigo-50/30 transition-colors duration-100"
                                        >
                                            <td className="px-5 py-4 text-gray-400 font-mono text-xs">
                                                {(surats.current_page - 1) * surats.per_page + idx + 1}
                                            </td>
                                            <td className="px-5 py-4">
                                                {surat.jenis_surat ? (
                                                    <div>
                                                        <span className="font-semibold text-gray-800">{surat.jenis_surat.kode}</span>
                                                        <p className="text-xs text-gray-400">{surat.jenis_surat.nama}</p>
                                                    </div>
                                                ) : <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-gray-700 max-w-xs truncate">{surat.perihal}</td>
                                            <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{formatDate(surat.tanggal_surat)}</td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={surat.status} />
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    id={`btn-detail-surat-${surat.id}`}
                                                    onClick={() => router.visit(route('sekretaris.surat.show', surat.id))}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Pagination ── */}
                {surats.last_page > 1 && (
                    <div className="mt-4 flex justify-end gap-1">
                        {surats.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    link.active
                                        ? 'text-white shadow-sm'
                                        : !link.url
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                                style={link.active ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } : {}}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
