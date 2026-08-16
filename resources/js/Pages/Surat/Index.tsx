import { router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, Plus, Search } from 'lucide-react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Rnd } from 'react-rnd';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import SpecimenQR from '../../components/common/SpecimenQR';
import { StatusBadge, statusConfiguration as STATUS_MAPPING } from '../../components/surat/StatusBadge';
import { useSuratFilters, type SuratSortKey } from '../../Hooks/useSuratFilters';
import type { Surat as SuratDetail, SuratStatus } from '../../Types/surat';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface User {
    id: number;
    name: string;
    email: string;
}

interface JenisSurat {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
}

interface Surat {
    id: number;
    nomor_surat_formatted: string | null;
    perihal: string;
    tujuan_surat: string;
    tanggal_surat: string;
    created_at: string;
    approved_at: string | null;
    status: 'draft' | 'menunggu_persetujuan' | 'ditolak' | 'disetujui';
    jenis_surat: JenisSurat | null;
    jenisSurat?: JenisSurat | null;
    created_by: number;
    created_by_user?: User | null;
    approved_by?: number | null;
    approved_by_user?: User | null;
    verification_token?: string | null;
    file_final?: { path?: string; original_name?: string; size?: number; mime?: string } | null;
    creator?: User | null;
    approver?: User | null;
    createdBy?: User | null;
    approvedBy?: User | null;
    file_hash?: string | null;
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
    auth: { user: { id: number; name: string; email: string; role_id?: number; role?: { name: string } } };
    surats: PaginatedSurats;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

const AKSI_CONFIG: Record<string, { label: string; color: string }> = {
    diajukan: { label: 'Diajukan', color: 'text-indigo-600 dark:text-indigo-400' },
    disetujui: { label: 'Disetujui', color: 'text-emerald-600 dark:text-emerald-400' },
    ditolak: { label: 'Ditolak', color: 'text-red-600 dark:text-red-400' },
};

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


export default function SuratIndex() {
    const { auth, surats, flash } = usePage<PageProps>().props;
    const user = auth?.user;

    const [searchQuery, setSearchQuery] = useState('');

    const [activeLetter, setActiveLetter] = useState<SuratDetail | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isSavingPlacement, setIsSavingPlacement] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Approver states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    // PDF Viewer States
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [renderedWidth, setRenderedWidth] = useState<number>(0);
    const [renderedHeight, setRenderedHeight] = useState<number>(0);
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const pdfWrapperRef = useRef<HTMLDivElement>(null);
    const [pdfWidth, setPdfWidth] = useState<number>(500);

    useEffect(() => {
        const updateWidth = () => {
            if (pdfWrapperRef.current) {
                // padding 32px (p-4 = 16px * 2)
                const wrapperWidth = pdfWrapperRef.current.clientWidth - 32;
                setPdfWidth(Math.min(wrapperWidth, 500));
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [activeLetter]);

    // QR Placement Coordinates States
    const [qrPosition, setQrPosition] = useState({
        page: 1,
        x: 0.5959420337578605,
        y: 0.8114879860558097,
        width: 0.32,
        height: 0.07
    });

    const [badgeState, setBadgeState] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    const isApprover = user?.role?.name?.toLowerCase() === 'approver' || user?.role_id === 2;
    const canSubmit = activeLetter
        ? !isApprover && (activeLetter.status === 'draft' || activeLetter.status === 'ditolak')
        : false;
    const isWaiting = activeLetter ? activeLetter.status === 'menunggu_persetujuan' : false;

    const updateBadgePixels = useCallback((dispW: number, dispH: number, x: number, y: number, w: number, h: number) => {
        if (dispW === 0 || dispH === 0) return;
        setBadgeState({
            x: x * dispW,
            y: y * dispH,
            width: w * dispW,
            height: h * dispH
        });
    }, []);

    useEffect(() => {
        if (renderedWidth > 0 && renderedHeight > 0) {
            updateBadgePixels(renderedWidth, renderedHeight, qrPosition.x, qrPosition.y, qrPosition.width, qrPosition.height);
        }
    }, [qrPosition, renderedWidth, renderedHeight, updateBadgePixels]);

    const handleDragStop = (_e: any, d: { x: number, y: number }) => {
        if (!canSubmit || renderedWidth === 0 || renderedHeight === 0) return;
        const newX = d.x / renderedWidth;
        const newY = d.y / renderedHeight;
        setQrPosition(prev => ({ ...prev, x: newX, y: newY, width: 0.32, height: 0.07 }));
        setBadgeState(prev => ({ ...prev, x: d.x, y: d.y }));
    };

    const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement, _delta: any, position: { x: number, y: number }) => {
        if (!canSubmit || renderedWidth === 0 || renderedHeight === 0) return;
        const newW = parseFloat(ref.style.width) / renderedWidth;
        const newH = parseFloat(ref.style.height) / renderedHeight;
        const newX = position.x / renderedWidth;
        const newY = position.y / renderedHeight;
        setQrPosition({ page: pageNumber, x: newX, y: newY, width: newW, height: newH });
        setBadgeState({ x: position.x, y: position.y, width: parseFloat(ref.style.width), height: parseFloat(ref.style.height) });
    };

    const loadLetterDetails = useCallback(async (id: number) => {
        setIsLoadingDetails(true);
        // Sync URL param
        const url = new URL(window.location.href);
        url.searchParams.set('open', String(id));
        window.history.pushState({}, '', url.toString());

        try {
            const res = await fetch(route('surat.show', id), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await res.json();
            setActiveLetter(data.surat);
            setPreviewUrl(data.previewUrl);

            const initialPos = data.surat.qr_position || data.surat.jenis_surat?.qr_position_default || {
                page: 1,
                x: 0.5959420337578605,
                y: 0.8114879860558097,
                width: 0.3283395755305868,
                height: 0.07663125948406677
            };
            setQrPosition({
                page: Number(initialPos.page) || 1,
                x: Number(initialPos.x) || 0,
                y: Number(initialPos.y) || 0,
                width: 0.32,
                height: 0.07
            });
            setPageNumber(Number(initialPos.page) || 1);
        } catch (e) {
            console.error('Failed to load letter details', e);
        } finally {
            setIsLoadingDetails(false);
        }
    }, []);

    const handleSavePlacement = () => {
        if (!activeLetter) return;

        setIsSavingPlacement(true);
        router.put(route('surat.placement.update', activeLetter.id), qrPosition, {
            preserveScroll: true,
            onFinish: () => {
                setIsSavingPlacement(false);
                loadLetterDetails(activeLetter.id);
            }
        });
    };

    const handleSubmitLetter = () => {
        if (!activeLetter) return;

        setIsSubmitting(true);
        router.post(
            route('surat.submit', activeLetter.id),
            {},
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowConfirm(false);
                    loadLetterDetails(activeLetter.id);
                },
            }
        );
    };

    const closeDetailView = () => {
        setActiveLetter(null);
        setPreviewUrl('');
        // Clean URL parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        window.history.pushState({}, '', url.toString());
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const openId = urlParams.get('open');
        if (openId) {
            loadLetterDetails(parseInt(openId));
        }
    }, [loadLetterDetails]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<SuratStatus | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const { filteredSurats, sortConfig, toggleSort } = useSuratFilters({
        data: surats.data,
        searchQuery,
        status: filterStatus,
        category: filterCategory,
    });

    const getSortIcon = (key: SuratSortKey) => {
        if (sortConfig.key !== key || !sortConfig.direction) {
            return <ArrowUpDown className="ml-1 size-3.5 text-gray-400 shrink-0" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ArrowUp className="ml-1 size-3.5 text-blue-500 shrink-0" />
        ) : (
            <ArrowDown className="ml-1 size-3.5 text-blue-500 shrink-0" />
        );
    };

    return (
        <AuthenticatedLayout>
            <PageMeta title={activeLetter ? `${activeLetter.perihal || 'Detail Surat'} | E-Surat` : "Daftar Surat | E-Surat"} description="Daftar Surat Keluar dan Masuk Yayasan PISSYA" />
            {activeLetter ? (
                <PageBreadcrumb pageTitle="Detail Surat" items={[{ name: "Daftar Surat", onClick: closeDetailView }]} />
            ) : (
                <PageBreadcrumb pageTitle="Daftar Surat" />
            )}

            <div className="space-y-6">
                {/* ── Flash message ── */}
                {flash?.success && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {isLoadingDetails ? (
                    <div className="flex items-center justify-center p-20 bg-white dark:bg-white/[0.03] border border-gray-250 dark:border-gray-800 rounded-2xl">
                        <svg className="w-8 h-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="ml-3 text-gray-500 dark:text-gray-400">Memuat detail surat...</span>
                    </div>
                ) : activeLetter ? (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Top Bar Detail (Back button, status, and actions) */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                            <div className="flex items-start sm:items-center gap-3">
                                <button
                                    onClick={closeDetailView}
                                    className="p-2 shrink-0 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 transition mt-0.5 sm:mt-0"
                                    title="Kembali ke Daftar Surat"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                </button>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-0">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Detail Surat</h2>
                                    <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusBadge status={activeLetter.status} />
                                        {activeLetter.nomor_surat_formatted && (
                                            <span className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 leading-none">
                                                {activeLetter.nomor_surat_formatted}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto pt-3 xl:pt-0 border-t border-gray-100 dark:border-gray-700 xl:border-0">
                                {activeLetter.status === 'disetujui' && activeLetter.verification_token && (
                                    <a
                                        href={route('surat.verify.download', activeLetter.verification_token)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 text-[14px] sm:text-[15px] font-semibold text-white bg-emerald-600 rounded-xl sm:rounded-full hover:bg-emerald-500 transition-all"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                                        </svg>
                                        <span className="truncate">Download PDF Final</span>
                                    </a>
                                )}
                                {canSubmit && (
                                    <button
                                        onClick={handleSavePlacement}
                                        disabled={isSavingPlacement || renderedWidth === 0}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 text-[14px] sm:text-[15px] font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-xl sm:rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                                        </svg>
                                        <span className="truncate">{isSavingPlacement ? 'Menyimpan...' : 'Simpan Posisi QR'}</span>
                                    </button>
                                )}
                                {canSubmit && (
                                    <button
                                        onClick={() => {
                                            if (!activeLetter.qr_position) {
                                                alert('Silakan simpan posisi QR Code terlebih dahulu sebelum mengajukan.');
                                                return;
                                            }
                                            setShowConfirm(true);
                                        }}
                                        disabled={!activeLetter.qr_position}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 text-[14px] sm:text-[15px] font-semibold text-white bg-blue-600 rounded-xl sm:rounded-full transition-all ${!activeLetter.qr_position ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                        </svg>
                                        <span className="truncate">{activeLetter.status === 'ditolak' ? 'Ajukan Ulang' : 'Ajukan ke Approver'}</span>
                                    </button>
                                )}
                                {isApprover && isWaiting && (
                                    <div className="flex w-full sm:w-auto items-center gap-2">
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={isApproving || isRejecting}
                                            className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-[14px] sm:text-[15px] font-semibold text-gray-800 bg-white border-2 border-gray-100 rounded-xl sm:rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Tolak
                                        </button>
                                        <button
                                            onClick={() => setShowApproveConfirm(true)}
                                            disabled={isApproving || isRejecting}
                                            className="flex-1 sm:flex-none relative px-4 py-2 sm:py-1.5 text-[14px] sm:text-[15px] font-semibold text-white bg-blue-600 rounded-xl sm:rounded-full hover:bg-blue-500 transition-all disabled:opacity-50"
                                        >
                                            {isApproving ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    <span className="truncate">Memproses...</span>
                                                </div>
                                            ) : (
                                                "Setujui"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rejection Note */}
                        {activeLetter.status === 'ditolak' && activeLetter.catatan_penolakan && (
                            <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl px-5 py-4">
                                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-0.5">Alasan Penolakan</p>
                                    <p className="text-sm text-red-650 dark:text-red-300">{activeLetter.catatan_penolakan}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* Metadata Column */}
                            <div className="xl:col-span-4 space-y-5">
                                {/* Info Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-205 text-sm">Informasi Surat</h3>
                                    </div>
                                    <div className="px-5 py-4 space-y-4">
                                        {[
                                            { label: 'Nomor Surat', value: activeLetter.nomor_surat_formatted || '—' },
                                            { label: 'Jenis Surat', value: activeLetter.jenis_surat ? `[${activeLetter.jenis_surat.kode}] ${activeLetter.jenis_surat.nama}` : '—' },
                                            { label: 'Lembaga', value: activeLetter.tujuan_surat },
                                            { label: 'Perihal', value: activeLetter.perihal },
                                            { label: 'Tanggal Surat', value: formatDate(activeLetter.tanggal_surat) },
                                            { label: 'Tanggal Upload', value: formatDate(activeLetter.created_at) },
                                        ].map((item) => (
                                            <div key={item.label}>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                                                <p className="text-sm text-gray-800 dark:text-gray-250 whitespace-pre-wrap">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* File Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-205 text-sm">File Draft</h3>
                                    </div>
                                    <div className="px-5 py-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-105 dark:border-gray-750">
                                            <div className="w-9 h-9 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center shrink-0">
                                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-gray-707 dark:text-gray-300 truncate">{activeLetter.file_draft?.original_name ?? 'draft.pdf'}</p>
                                                <p className="text-xs text-gray-400">{activeLetter.file_draft?.size ? formatFileSize(activeLetter.file_draft.size) : '—'}</p>
                                            </div>
                                            <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition"
                                                title="Buka di tab baru"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* History Card */}
                                {activeLetter.approval_logs && activeLetter.approval_logs.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-105 dark:border-gray-700">
                                            <h3 className="font-semibold text-gray-808 dark:text-gray-200 text-sm">Riwayat Aktivitas</h3>
                                        </div>
                                        <div className="px-5 py-4">
                                            <ol className="relative border-l border-gray-100 dark:border-gray-700 ml-2 space-y-4">
                                                {activeLetter.approval_logs.map((log) => {
                                                    const cfg = AKSI_CONFIG[log.aksi] ?? { label: log.aksi, color: 'text-gray-600 dark:text-gray-400' };
                                                    return (
                                                        <li key={log.id} className="ml-4">
                                                            <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 bg-indigo-300 dark:bg-indigo-500" />
                                                            <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{log.user?.name ?? 'Sistem'}</p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(log.created_at)}</p>
                                                            {log.catatan && (
                                                                <p className="mt-1 text-xs text-gray-650 dark:text-gray-305 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-2 py-1">{log.catatan}</p>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PDF Preview & QR Placement Editor */}
                            <div className="xl:col-span-8 flex flex-col items-center">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-t-2xl shadow-sm border border-gray-200 dark:border-gray-700 border-b-0 flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-205 text-sm">Dokumen & Penempatan QR Code</h3>
                                        {canSubmit && (
                                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                                                Mode Edit
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium text-gray-705 dark:text-gray-300">
                                            Halaman {pageNumber} dari {numPages || '-'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                disabled={pageNumber <= 1}
                                                onClick={() => {
                                                    setPageNumber(prev => prev - 1);
                                                    if (canSubmit) setQrPosition(prev => ({ ...prev, page: pageNumber - 1 }));
                                                }}
                                                className="p-1.5 border dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-55 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                                </svg>
                                            </button>
                                            <button
                                                disabled={pageNumber >= (numPages || 1)}
                                                onClick={() => {
                                                    setPageNumber(prev => prev + 1);
                                                    if (canSubmit) setQrPosition(prev => ({ ...prev, page: pageNumber + 1 }));
                                                }}
                                                className="p-1.5 border dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-55 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* PDF wrapper inside container */}
                                <div 
                                    ref={pdfWrapperRef}
                                    className="w-full bg-gray-100 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 rounded-b-2xl shadow-inner flex justify-center overflow-auto max-h-[600px]"
                                >
                                    <div
                                        ref={pdfContainerRef}
                                        className="relative bg-white shadow-xl overflow-hidden rounded-sm"
                                        style={{ width: renderedWidth || 'auto', height: renderedHeight || 'auto', margin: '0 auto' }}
                                    >
                                        <Document
                                            file={previewUrl}
                                            onLoadSuccess={({ numPages }) => {
                                                setNumPages(numPages);
                                                if (pageNumber > numPages) {
                                                    setPageNumber(1);
                                                    if (canSubmit) setQrPosition(prev => ({ ...prev, page: 1 }));
                                                }
                                            }}
                                            className="flex justify-center"
                                            loading={<div className="p-20 text-gray-500 dark:text-gray-400">Memuat PDF...</div>}
                                        >
                                            {numPages && Number(pageNumber) <= numPages && (
                                                <Page
                                                    pageNumber={Number(pageNumber)}
                                                    onRenderSuccess={() => {
                                                        if (pdfContainerRef.current) {
                                                            const pageElement = pdfContainerRef.current.querySelector('.react-pdf__Page') as HTMLElement;
                                                            if (pageElement) {
                                                                const w = pageElement.offsetWidth;
                                                                const h = pageElement.offsetHeight;
                                                                setRenderedWidth(w);
                                                                setRenderedHeight(h);
                                                                const isLandscape = w > h;
                                                                setQrPosition(prev => ({
                                                                    ...prev,
                                                                    width: 0.32,
                                                                    height: isLandscape ? 0.14 : 0.07
                                                                }));
                                                                updateBadgePixels(w, h, qrPosition.x, qrPosition.y, 0.32, isLandscape ? 0.14 : 0.07);
                                                            }
                                                        }
                                                    }}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                    width={pdfWidth}
                                                    className="border border-gray-200 dark:border-gray-700"
                                                />
                                            )}
                                        </Document>

                                        {/* Drag and Drop Signature Area */}
                                        {activeLetter.status !== 'disetujui' && renderedWidth > 0 && renderedHeight > 0 && Number(pageNumber) === Number(qrPosition.page) && (
                                            <Rnd
                                                size={{ width: badgeState.width, height: badgeState.height }}
                                                position={{ x: badgeState.x, y: badgeState.y }}
                                                onDragStop={handleDragStop}
                                                onResizeStop={handleResizeStop}
                                                bounds="parent"
                                                lockAspectRatio={2.6}
                                                disableDragging={!canSubmit}
                                                enableResizing={false}
                                                className={`absolute z-10 rounded shadow-md bg-white/90 overflow-hidden ${canSubmit
                                                    ? 'border-2 border-indigo-500 cursor-move group'
                                                    : 'border border-gray-300 opacity-80 pointer-events-none'
                                                    }`}
                                            >
                                                <SpecimenQR canSubmit={canSubmit} />
                                            </Rnd>
                                        )}
                                    </div>
                                </div>
                                {canSubmit && (
                                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-450 text-center w-full">
                                        Seret (drag) kotak spesimen untuk memindahkan posisi QR Code. Tarik ujung kanan bawah untuk mengubah ukuran. Jangan lupa klik <strong>Simpan Posisi QR</strong>.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Table Card ── */
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Daftar Surat Keluar/Masuk
                                </h3>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                {/* Search bar */}
                                <div className="relative w-full sm:w-auto">
                                    <span className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2">
                                        <Search className="size-4 text-gray-500 dark:text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Cari perihal atau tujuan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9 w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-300 focus:outline-hidden focus:ring-3 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800 sm:w-[250px]"
                                    />
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    {/* Filter Button */}
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-9 rounded-lg border border-gray-200 bg-transparent px-4 text-sm shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] transition-colors ${isFilterOpen
                                            ? 'text-blue-600 border-blue-200 bg-blue-50/50 dark:text-blue-400 dark:border-blue-800/50'
                                            : 'text-gray-850 dark:text-white/90'
                                            }`}
                                    >
                                        <SlidersHorizontal className="size-4" />
                                        <span>Filter</span>
                                    </button>

                                    {/* Upload Surat Button */}
                                    <button
                                        onClick={() => router.visit(route('surat.create'))}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-9 rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-4 text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        <Plus className="size-4 text-white" />
                                        <span className="hidden sm:inline">Upload Surat Baru</span>
                                        <span className="sm:hidden">Upload</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filter Panel */}
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isFilterOpen ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"
                                }`}
                        >
                            <div className="overflow-hidden">
                                <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-white/[0.02]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                            <select
                                                value={filterStatus}
                                                onChange={(event) => setFilterStatus(event.target.value as SuratStatus | 'all')}
                                                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-transparent dark:border-gray-800 text-sm text-gray-800 dark:text-white"
                                            >
                                                <option value="all">Semua Status</option>
                                                <option value="draft">Draft</option>
                                                <option value="menunggu_persetujuan">Menunggu Persetujuan</option>
                                                <option value="disetujui">Disetujui</option>
                                                <option value="ditolak">Ditolak</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kategori Surat</label>
                                            <select
                                                value={filterCategory}
                                                onChange={(e) => setFilterCategory(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-transparent dark:border-gray-800 text-sm text-gray-800 dark:text-white"
                                            >
                                                <option value="all">Semua Kategori</option>
                                                <option value="surat_masuk">Surat Masuk</option>
                                                <option value="surat_keluar">Surat Keluar</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                                        <button
                                            onClick={() => {
                                                setFilterStatus('all');
                                                setFilterCategory('all');
                                                setSearchQuery('');
                                            }}
                                            className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="block md:hidden space-y-3">
                            {filteredSurats.length > 0 ? (
                                filteredSurats.map((surat) => {
                                    const creator = surat.creator || surat.created_by_relation || surat.created_by_user || (user?.id === surat.created_by ? user : null);
                                    const jenisSurat = surat.jenis_surat || surat.jenis_surat;
                                    const dateStart = new Date(surat.tanggal_surat);
                                    const formattedStartDay = dateStart.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                                    const statusCfg = STATUS_MAPPING[surat.status];

                                    return (
                                        <div 
                                            key={surat.id} 
                                            onClick={() => loadLetterDetails(surat.id)}
                                            className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-white/[0.02] shadow-sm flex flex-col gap-3 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="min-w-0">
                                                    <span className="block font-semibold text-gray-800 dark:text-white/90 text-start text-sm font-mono mb-1 truncate max-w-full">
                                                        {surat.nomor_surat_formatted || `SUR-${String(surat.id).padStart(5, '0')}`}
                                                    </span>
                                                    <span className="block font-medium text-gray-800 text-sm dark:text-white/90 text-start line-clamp-2">
                                                        {surat.perihal}
                                                    </span>
                                                </div>
                                                <Badge size="sm" color={statusCfg.color} className="shrink-0">
                                                    {statusCfg.label}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                    </svg>
                                                    <span className="truncate max-w-[120px]">{creator?.name || 'Sekretaris'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5m-9-5.25h.008v.008H12v-.008Z" />
                                                    </svg>
                                                    <span>{formattedStartDay}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 w-full">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/80">
                                                        {jenisSurat?.nama ? jenisSurat.nama : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-10 text-center text-gray-500">
                                    Tidak ada surat ditemukan.
                                </div>
                            )}
                        </div>

                        {/* Table View (Desktop) */}
                        <div className="hidden md:block max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                    <TableRow>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                            onClick={() => toggleSort('nomor_surat_formatted')}
                                        >
                                            <div className="flex items-center">
                                                No. Surat
                                                {getSortIcon('nomor_surat_formatted')}
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                            onClick={() => toggleSort('perihal')}
                                        >
                                            <div className="flex items-center">
                                                Perihal
                                                {getSortIcon('perihal')}
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                            onClick={() => toggleSort('tanggal_surat')}
                                        >
                                            <div className="flex items-center">
                                                Tanggal Surat
                                                {getSortIcon('tanggal_surat')}
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                            onClick={() => toggleSort('jenis_surat')}
                                        >
                                            <div className="flex items-center">
                                                Jenis Surat
                                                {getSortIcon('jenis_surat')}
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Status
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredSurats.length > 0 ? (
                                        filteredSurats.map((surat) => {
                                            // Retrieve dynamic values based on E-Surat structure
                                            const creator = surat.creator || surat.created_by_relation || surat.created_by_user || (user?.id === surat.created_by ? user : null);
                                            const jenisSurat = surat.jenis_surat || surat.jenis_surat;
                                            const dateStart = new Date(surat.tanggal_surat);

                                            // Format tanggal surat
                                            const formattedStartDay = dateStart.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

                                            // Status mapping from E-Surat structure
                                            const statusCfg = STATUS_MAPPING[surat.status];

                                            return (
                                                <TableRow 
                                                    key={surat.id}
                                                    onClick={() => loadLetterDetails(surat.id)}
                                                    className="cursor-pointer hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors"
                                                >
                                                    <TableCell className="py-3.5 font-semibold text-theme-sm font-mono text-start">
                                                        <span className="block font-semibold text-gray-800 dark:text-white/90 text-start group-hover:text-brand-500">
                                                            {surat.nomor_surat_formatted || `SUR-${String(surat.id).padStart(5, '0')}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3.5">
                                                        <div className="flex items-start gap-3">
                                                            <div>
                                                                <span className="block font-semibold text-gray-800 text-theme-sm dark:text-white/90 text-start">
                                                                    {surat.perihal}
                                                                </span>
                                                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                                    oleh {creator?.name || 'Sekretaris'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3.5 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                            {formattedStartDay}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3.5">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/80">
                                                            {jenisSurat?.nama
                                                                ? jenisSurat.nama
                                                                : '—'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3.5">
                                                        <Badge size="sm" color={statusCfg.color}>
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                                                Tidak ada surat ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {surats.last_page > 1 && (
                            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Menampilkan Halaman {surats.current_page} dari {surats.last_page}
                                </span>
                                <div className="flex gap-1">
                                    {surats.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${link.active
                                                ? 'bg-brand-500 text-white shadow-sm'
                                                : !link.url
                                                    ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Approve Confirmation Modal ── */}
            <ConfirmDialog
                open={showApproveConfirm}
                icon={
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                }
                iconBgClass="bg-blue-100"
                title="Setujui surat ini?"
                description={
                    <>Surat akan ditandai sebagai <span className="font-semibold text-blue-600 dark:text-blue-400">Disetujui</span> dan tidak dapat diubah kembali.</>
                }
                cancelLabel="Batal"
                confirmLabel="Setujui"
                confirmBtnClass="bg-blue-600 hover:bg-blue-500"
                isLoading={isApproving}
                onCancel={() => setShowApproveConfirm(false)}
                onConfirm={() => {
                    if (!activeLetter) return;
                    setIsApproving(true);
                    router.post(
                        route('surat.approve', activeLetter.id),
                        {},
                        {
                            onSuccess: () => {
                                setShowApproveConfirm(false);
                                closeDetailView();
                            },
                            onFinish: () => setIsApproving(false),
                        }
                    );
                }}
            />

            {/* ── Submit / Ajukan Confirmation Modal ── */}
            <ConfirmDialog
                open={showConfirm}
                icon={
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                }
                iconBgClass="bg-indigo-100"
                title="Ajukan surat ini?"
                description="Surat akan dikirim ke approver untuk ditinjau. Setelah diajukan, Anda tidak dapat mengubah isi surat tanpa mengajukan revisi."
                cancelLabel="Batal"
                confirmLabel="Ya, Ajukan"
                confirmBtnClass="bg-indigo-600 hover:bg-indigo-700"
                isLoading={isSubmitting}
                onCancel={() => setShowConfirm(false)}
                onConfirm={handleSubmitLetter}
            />

            {/* ── Reject Modal ── */}
            <ConfirmDialog
                open={showRejectModal}
                icon={
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                }
                iconBgClass="bg-red-100"
                title="Tolak surat ini?"
                description="Berikan alasan penolakan agar pembuat surat dapat melakukan perbaikan."
                extra={
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Alasan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder:text-gray-400 transition resize-none"
                            placeholder="Masukkan alasan penolakan..."
                        />
                    </div>
                }
                cancelLabel="Batal"
                confirmLabel="Ya, Tolak"
                confirmBtnClass="bg-red-500 hover:bg-red-600"
                isLoading={isRejecting}
                confirmDisabled={!rejectNote.trim()}
                onCancel={() => {
                    setShowRejectModal(false);
                    setRejectNote('');
                }}
                onConfirm={() => {
                    if (!rejectNote.trim()) return;
                    setIsRejecting(true);
                    router.post(
                        route('surat.reject', activeLetter?.id),
                        { catatan_penolakan: rejectNote },
                        {
                            onSuccess: () => {
                                setShowRejectModal(false);
                                setRejectNote('');
                                closeDetailView();
                            },
                            onFinish: () => setIsRejecting(false),
                        }
                    );
                }}
            />
        </AuthenticatedLayout>
    );
}
