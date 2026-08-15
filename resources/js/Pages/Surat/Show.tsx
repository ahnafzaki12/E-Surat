import { router, usePage, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Rnd } from 'react-rnd';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import SpecimenQR from '../../components/common/SpecimenQR';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface JenisSurat {
    id: number;
    kode: string;
    nama: string;
    qr_position_default: any;
}

interface ApprovalLog {
    id: number;
    aksi: string;
    catatan: string | null;
    created_at: string;
    user: { name: string } | null;
}

interface FileDraft {
    path: string;
    original_name: string;
    size: number;
    mime: string;
}

interface Surat {
    id: number;
    perihal: string;
    tujuan_surat: string;
    tanggal_surat: string;
    nomor_surat_formatted: string | null;
    status: string;
    catatan_penolakan: string | null;
    file_draft: FileDraft;
    qr_position: Record<string, any> | null;
    jenis_surat: JenisSurat | null;
    approval_logs: ApprovalLog[];
    created_at: string;
    approved_at: string | null;
}

interface PageProps {
    auth: { user: { id: number; name: string; email: string; role?: { name: string } } };
    surat: Surat;
    previewUrl: string;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

const STATUS_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; borderClass: string; dot: string }> = {
    draft: {
        label: 'Draft',
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-700',
        borderClass: 'border-gray-200',
        dot: 'bg-gray-400',
    },
    menunggu_persetujuan: {
        label: 'Menunggu Persetujuan',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
        dot: 'bg-amber-400',
    },
    ditolak: {
        label: 'Ditolak',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        borderClass: 'border-red-200',
        dot: 'bg-red-500',
    },
    disetujui: {
        label: 'Disetujui',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
        dot: 'bg-emerald-500',
    },
};

const AKSI_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    diajukan: { label: 'Diajukan', icon: '📤', color: 'text-indigo-600' },
    disetujui: { label: 'Disetujui', icon: '✅', color: 'text-emerald-600' },
    ditolak: { label: 'Ditolak', icon: '❌', color: 'text-red-600' },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-600',
        borderClass: 'border-gray-200',
        dot: 'bg-gray-400',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatFileSize(bytes: number) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function SuratShow() {
    const { auth, surat, previewUrl, flash } = usePage<PageProps>().props;
    const user = auth?.user;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const canSubmit = surat.status === 'draft' || surat.status === 'ditolak';
    const isWaiting = surat.status === 'menunggu_persetujuan';
    const isApproved = surat.status === 'disetujui';

    // --- PLACEMENT EDITOR STATE ---
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [renderedWidth, setRenderedWidth] = useState<number>(0);
    const [renderedHeight, setRenderedHeight] = useState<number>(0);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    const initialPos = surat.qr_position || surat.jenis_surat?.qr_position_default || {
        page: 1,
        x: 0.5959420337578605,
        y: 0.8114879860558097,
        width: 0.3283395755305868,
        height: 0.07663125948406677
    };

    const [badgeState, setBadgeState] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    const { data, setData, put, processing } = useForm({
        page: Number(initialPos.page) || 1,
        x: Number(initialPos.x) || 0,
        y: Number(initialPos.y) || 0,
        width: Number(initialPos.width) || 0,
        height: Number(initialPos.height) || 0
    });

    useEffect(() => {
        if (surat) {
            const pos = surat.qr_position || surat.jenis_surat?.qr_position_default || {
                page: 1,
                x: 0.5959420337578605,
                y: 0.8114879860558097,
                width: 0.3283395755305868,
                height: 0.07663125948406677
            };
            const p = Number(pos.page) || 1;
            setData({
                page: p,
                x: Number(pos.x) || 0,
                y: Number(pos.y) || 0,
                width: Number(pos.width) || 0,
                height: Number(pos.height) || 0
            });
            setPageNumber(p);
        }
    }, [surat]);

    useEffect(() => {
        if (renderedWidth > 0 && renderedHeight > 0) {
            setBadgeState({
                x: data.x * renderedWidth,
                y: data.y * renderedHeight,
                width: data.width * renderedWidth,
                height: data.height * renderedHeight
            });
        }
    }, [data.x, data.y, data.width, data.height, renderedWidth, renderedHeight]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        if (pageNumber > numPages) {
            setPageNumber(1);
            if (canSubmit) setData('page', 1);
        }
    }

    function onPageRenderSuccess() {
        if (pdfContainerRef.current) {
            const pageElement = pdfContainerRef.current.querySelector('.react-pdf__Page') as HTMLElement;
            if (pageElement) {
                const w = pageElement.offsetWidth;
                const h = pageElement.offsetHeight;
                setRenderedWidth(w);
                setRenderedHeight(h);
            }
        }
    }

    const handleDragStop = (_e: any, d: { x: number, y: number }) => {
        if (!canSubmit || renderedWidth === 0 || renderedHeight === 0) return;
        const newX = d.x / renderedWidth;
        const newY = d.y / renderedHeight;
        setData({
            ...data,
            page: pageNumber,
            x: newX,
            y: newY
        });
    };

    const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement, _delta: any, position: { x: number, y: number }) => {
        if (!canSubmit || renderedWidth === 0 || renderedHeight === 0) return;
        const newW = parseFloat(ref.style.width) / renderedWidth;
        const newH = parseFloat(ref.style.height) / renderedHeight;
        const newX = position.x / renderedWidth;
        const newY = position.y / renderedHeight;
        setData({
            page: pageNumber,
            x: newX,
            y: newY,
            width: newW,
            height: newH
        });
    };

    const handleSavePlacement = () => {
        put(route('surat.placement.update', surat.id), { preserveScroll: true });
    };

    const handleLogout = () => router.post(route('logout'));

    const handleSubmit = () => {
        setIsSubmitting(true);
        router.post(
            route('surat.submit', surat.id),
            {},
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowConfirm(false);
                },
            }
        );
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)' }}>
            {/* ── Navbar ── */}
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.visit(route('surat.index'))}
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
                            <span className="text-base font-bold text-gray-900">Detail Surat & Penempatan QR</span>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <PageBreadcrumb pageTitle="Detail Surat" items={[{ name: "List Surat", path: "/surat" }]} />
                {/* ── Flash ── */}
                {flash?.success && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* ── Minimalist Header Action Bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-150 dark:border-gray-800">
                    <button
                        onClick={() => router.visit(route('surat.index'))}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Daftar Surat
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={surat.status} />
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-450">
                            ID: #{surat.id}
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 ml-2">
                            {canSubmit && (
                                <button
                                    onClick={handleSavePlacement}
                                    disabled={processing || renderedWidth === 0}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-250 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl shadow-xs transition disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                                    </svg>
                                    {processing ? 'Menyimpan...' : 'Simpan Posisi QR'}
                                </button>
                            )}
                            {canSubmit && (
                                <button
                                    id="btn-ajukan-surat"
                                    onClick={() => {
                                        if (!surat.qr_position) {
                                            alert('Silakan simpan posisi QR Code terlebih dahulu sebelum mengajukan.');
                                            return;
                                        }
                                        setShowConfirm(true);
                                    }}
                                    disabled={!surat.qr_position}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition duration-200 active:scale-95 ${!surat.qr_position ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                                    style={surat.qr_position ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } : { background: '#9ca3af' }}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                    </svg>
                                    {surat.status === 'ditolak' ? 'Ajukan Ulang' : 'Ajukan ke Approver'}
                                </button>
                            )}
                            {isWaiting && (
                                <span className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-4 py-2 rounded-xl">
                                    ⏳ Menunggu keputusan approver
                                </span>
                            )}
                            {isApproved && (
                                <span className="text-sm text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 px-4 py-2 rounded-xl">
                                    ✅ Surat telah disetujui
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Catatan penolakan ── */}
                {surat.status === 'ditolak' && surat.catatan_penolakan && (
                    <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-red-700 mb-0.5">Alasan Penolakan</p>
                            <p className="text-sm text-red-600">{surat.catatan_penolakan}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* ── Sidebar Metadata ── */}
                    <div className="xl:col-span-4 space-y-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800 text-sm">Informasi Surat</h2>
                            </div>
                            <div className="px-5 py-4 space-y-4">
                                {[
                                    {
                                        label: 'Nomor Surat',
                                        value: surat.nomor_surat_formatted || '—',
                                    },
                                    {
                                        label: 'Jenis Surat',
                                        value: surat.jenis_surat
                                            ? `[${surat.jenis_surat.kode}] ${surat.jenis_surat.nama}`
                                            : '—',
                                    },
                                    { label: 'Lembaga', value: surat.tujuan_surat },
                                    { label: 'Perihal', value: surat.perihal },
                                    { label: 'Tanggal Surat', value: formatDate(surat.tanggal_surat) },
                                    { label: 'Tanggal Upload', value: formatDate(surat.created_at) },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                                            {item.label}
                                        </p>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* File info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="font-semibold text-gray-800 text-sm">File Draft</h2>
                            </div>
                            <div className="px-5 py-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate">
                                            {surat.file_draft?.original_name ?? 'draft.pdf'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {surat.file_draft?.size ? formatFileSize(surat.file_draft.size) : '—'}
                                        </p>
                                    </div>
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        title="Buka di tab baru"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat */}
                        {surat.approval_logs.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-50">
                                    <h2 className="font-semibold text-gray-800 text-sm">Riwayat Aktivitas</h2>
                                </div>
                                <div className="px-5 py-4">
                                    <ol className="relative border-l border-gray-100 ml-2 space-y-4">
                                        {surat.approval_logs.map((log) => {
                                            const cfg = AKSI_CONFIG[log.aksi] ?? { label: log.aksi, icon: '📋', color: 'text-gray-600' };
                                            return (
                                                <li key={log.id} className="ml-4">
                                                    <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full border-2 border-white bg-indigo-300" />
                                                    <p className={`text-xs font-semibold ${cfg.color}`}>
                                                        {cfg.icon} {cfg.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{log.user?.name ?? 'Sistem'}</p>
                                                    <p className="text-xs text-gray-400">{formatDateTime(log.created_at)}</p>
                                                    {log.catatan && (
                                                        <p className="mt-1 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
                                                            {log.catatan}
                                                        </p>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── PDF Area (Placement Editor / Preview) ── */}
                    <div className="xl:col-span-8 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-t-2xl shadow-sm border border-gray-200 border-b-0 flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <h2 className="font-semibold text-gray-800 text-sm">Dokumen & Penempatan QR Code</h2>
                                {canSubmit && (
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                        Mode Edit
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-gray-700">
                                    Halaman {pageNumber} dari {numPages || '-'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={pageNumber <= 1}
                                        onClick={() => {
                                            setPageNumber(prev => prev - 1);
                                            if (canSubmit) setData('page', pageNumber - 1);
                                        }}
                                        className="p-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                        </svg>
                                    </button>
                                    <button
                                        disabled={pageNumber >= (numPages || 1)}
                                        onClick={() => {
                                            setPageNumber(prev => prev + 1);
                                            if (canSubmit) setData('page', pageNumber + 1);
                                        }}
                                        className="p-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PDF Wrapper */}
                        <div className="w-full bg-gray-100 p-4 border border-gray-200 rounded-b-2xl shadow-inner flex justify-center overflow-auto" style={{ minHeight: '600px' }}>
                            <div
                                ref={pdfContainerRef}
                                className="relative bg-white shadow-xl overflow-hidden rounded-sm"
                                style={{ width: 'fit-content', margin: '0 auto' }}
                            >
                                <Document
                                    file={previewUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    className="flex justify-center"
                                    loading={<div className="p-20 text-gray-500">Memuat PDF...</div>}
                                >
                                    {numPages && Number(pageNumber) <= numPages && (
                                        <Page
                                            pageNumber={Number(pageNumber)}
                                            onRenderSuccess={onPageRenderSuccess}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            width={800}
                                            className="border border-gray-200"
                                        />
                                    )}
                                </Document>

                                {/* Drag and Drop Layer */}
                                {renderedWidth > 0 && renderedHeight > 0 && pageNumber === data.page && (
                                    <Rnd
                                        size={{ width: badgeState.width, height: badgeState.height }}
                                        position={{ x: badgeState.x, y: badgeState.y }}
                                        onDragStop={handleDragStop}
                                        onResizeStop={handleResizeStop}
                                        bounds="parent"
                                        lockAspectRatio={2.6}
                                        disableDragging={!canSubmit}
                                        enableResizing={canSubmit}
                                        className={`absolute z-10 rounded shadow-md bg-white/90 overflow-hidden ${canSubmit
                                            ? 'border-2 border-indigo-500 cursor-move group'
                                            : 'border border-gray-300 opacity-80 pointer-events-none'
                                            }`}
                                    >
                                        {/* Specimen UI */}
                                        <SpecimenQR canSubmit={canSubmit} showResizeHandle={true} />
                                    </Rnd>
                                )}
                            </div>
                        </div>
                        {canSubmit && (
                            <p className="mt-3 text-xs text-gray-500 text-center w-full">
                                Seret (drag) kotak spesimen untuk memindahkan posisi QR Code. Tarik ujung kanan bawah untuk mengubah ukuran. Jangan lupa klik <strong>Simpan Posisi QR</strong>.
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Confirm Modal ── */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900">Ajukan Surat?</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Surat akan dikirim ke approver untuk ditinjau. Setelah diajukan, Anda tidak dapat mengubah isi surat tanpa mengajukan revisi.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition"
                            >
                                Batal
                            </button>
                            <button
                                id="btn-konfirmasi-ajukan"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                            >
                                {isSubmitting ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : null}
                                Ya, Ajukan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

