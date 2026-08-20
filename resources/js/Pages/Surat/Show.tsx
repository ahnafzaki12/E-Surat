import { router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, DragEvent } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { pdfjs, Document, Page } from 'react-pdf';
import { Rnd } from 'react-rnd';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import SpecimenQR from '../../components/common/SpecimenQR';
import { StatusBadge } from '../../components/surat/StatusBadge';
import type { Surat } from '../../Types/surat';
import ConfirmDialog from '../../components/common/ConfirmDialog';
// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();



interface PageProps {
    auth: { user: { id: number; name: string; email: string; role_id?: number; role?: { name: string; permissions?: string[] } } };
    surat: Surat;
    previewUrl: string;
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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function SuratShow() {
    const { auth, surat: activeLetter, previewUrl, flash } = usePage<PageProps>().props;
    const user = auth?.user;


    const [isSavingPlacement, setIsSavingPlacement] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Re-upload file draft states
    const [replacementFile, setReplacementFile] = useState<File | null>(null);
    const [isReplacingFile, setIsReplacingFile] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);

    const isSekretarisYayasan = user?.role?.name === 'sekretaris_yayasan';
    const isCreator = activeLetter?.created_by === user?.id;
    const hasReplacePermission = user?.role?.permissions?.includes('surat.replace-file') ?? false;
    const canReplaceFile = hasReplacePermission && (isSekretarisYayasan || isCreator);

    const setReplacementPdf = (file: File | undefined) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diizinkan.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert('Ukuran file tidak boleh melebihi 5 MB.');
            return;
        }
        setReplacementFile(file);
    };

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
        x: 0.59,
        y: 0.81,
        width: 0.32,
        height: 0.07
    });

    const [badgeState, setBadgeState] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    const hasSubmitPermission = user?.role?.permissions?.includes('surat.submit') ?? false;
    const hasPlacementPermission = user?.role?.permissions?.includes('surat.placement') ?? false;

    const isApprover = user?.role?.name?.toLowerCase() === 'approver' || user?.role_id === 2;
    const canSubmit = activeLetter
        ? hasSubmitPermission && !isApprover && (activeLetter.status === 'draft' || activeLetter.status === 'ditolak')
        : false;
    const canSavePlacement = activeLetter
        ? hasPlacementPermission && !isApprover && (activeLetter.status === 'draft' || activeLetter.status === 'ditolak')
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
        setQrPosition(prev => ({ ...prev, x: newX, y: newY }));
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

    // Initialize QR position from activeLetter
    useEffect(() => {
        if (activeLetter) {
            const initialPos = activeLetter.qr_position || {
                page: 1,
                x: 0.5959,
                y: 0.8114,
                width: 0.3283,
                height: 0.0766
            };
            setQrPosition({
                page: Number(initialPos.page) || 1,
                x: Number(initialPos.x) || 0,
                y: Number(initialPos.y) || 0,
                width: Number(initialPos.width) || 0.32,
                height: Number(initialPos.height) || 0.07
            });
            setPageNumber(Number(initialPos.page) || 1);
        }
    }, [activeLetter]);

    const handleSavePlacement = () => {
        if (!activeLetter) return;
        setIsSavingPlacement(true);
        router.put(route('surat.placement.update', activeLetter.id), qrPosition, {
            preserveScroll: true,
            onFinish: () => {
                setIsSavingPlacement(false);
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
                },
            }
        );
    };

    const closeDetailView = () => {
        router.visit(route('surat.index'));
    };
    return (
        <AuthenticatedLayout>
            <PageMeta title={activeLetter ? `${activeLetter.perihal || 'Detail Surat'} | E-Surat` : "Detail Surat | E-Surat"} description="Detail Surat Keluar dan Masuk Yayasan PISSYA" />
            <PageBreadcrumb pageTitle="Detail Surat" items={[{ name: "Daftar Surat", onClick: closeDetailView }]} />

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

                {activeLetter && (
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
                                {canSavePlacement && activeLetter.status !== 'ditolak' && (
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
                                            if (activeLetter.status === 'ditolak') {
                                                setIsSavingPlacement(true);
                                                router.put(route('surat.placement.update', activeLetter.id), qrPosition, {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        setShowConfirm(true);
                                                    },
                                                    onFinish: () => {
                                                        setIsSavingPlacement(false);
                                                    }
                                                });
                                            } else {
                                                if (!activeLetter.qr_position) {
                                                    alert('Silakan simpan posisi QR Code terlebih dahulu sebelum mengajukan.');
                                                    return;
                                                }
                                                setShowConfirm(true);
                                            }
                                        }}
                                        disabled={(activeLetter.status !== 'ditolak' && !activeLetter.qr_position) || isSavingPlacement || (activeLetter.status === 'ditolak' && renderedWidth === 0)}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 text-[14px] sm:text-[15px] font-semibold text-white bg-blue-600 rounded-xl sm:rounded-full transition-all ${((activeLetter.status !== 'ditolak' && !activeLetter.qr_position) || isSavingPlacement || (activeLetter.status === 'ditolak' && renderedWidth === 0)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                        </svg>
                                        <span className="truncate">
                                            {activeLetter.status === 'ditolak' 
                                                ? (isSavingPlacement ? 'Menyimpan...' : 'Simpan Posisi QR & Ajukan Ulang') 
                                                : 'Ajukan ke Approver'}
                                        </span>
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
                                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-205 text-sm">File Draft</h3>
                                        {activeLetter.status === 'ditolak' && !isApprover && (
                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/50">
                                                Perlu Revisi
                                            </span>
                                        )}
                                    </div>
                                    <div className="px-5 py-4 space-y-4">
                                        {/* Current file display */}
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

                                        {/* Re-upload section — only shown when ditolak and user is not approver */}
                                        {activeLetter.status === 'ditolak' && !isApprover && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 shrink-0">Upload Ulang</p>
                                                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                                                </div>

                                                {/* Hidden file input */}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        setReplacementPdf(f);
                                                        e.target.value = '';
                                                    }}
                                                />

                                                {/* Drop zone */}
                                                <div
                                                    onClick={(e) => {
                                                        if (!canReplaceFile) {
                                                            e.preventDefault();
                                                            setShowUnauthorizedModal(true);
                                                            return;
                                                        }
                                                        fileInputRef.current?.click();
                                                    }}
                                                    onDragOver={(e: DragEvent<HTMLDivElement>) => {
                                                        e.preventDefault();
                                                        if (canReplaceFile) setIsDragOver(true);
                                                    }}
                                                    onDragLeave={() => setIsDragOver(false)}
                                                    onDrop={(e: DragEvent<HTMLDivElement>) => {
                                                        e.preventDefault();
                                                        setIsDragOver(false);
                                                        if (!canReplaceFile) {
                                                            setShowUnauthorizedModal(true);
                                                            return;
                                                        }
                                                        const f = e.dataTransfer.files?.[0];
                                                        setReplacementPdf(f);
                                                    }}
                                                    className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all p-4 text-center select-none
                                                        ${
                                                            isDragOver
                                                                ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                                                                : replacementFile
                                                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 bg-gray-50 dark:bg-gray-900 hover:bg-red-50/50 dark:hover:bg-red-950/10'
                                                        }`}
                                                >
                                                    {replacementFile ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg flex items-center justify-center shrink-0">
                                                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0 flex-1 text-left">
                                                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate">{replacementFile.name}</p>
                                                                <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">{formatFileSize(replacementFile.size)}</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setReplacementFile(null); }}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition shrink-0"
                                                                title="Hapus pilihan"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="py-2">
                                                            <div className="mx-auto w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center mb-2">
                                                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                                                </svg>
                                                            </div>
                                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Klik atau seret file PDF baru</p>
                                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Maks. 5 MB · hanya PDF</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Submit button */}
                                                {replacementFile && (
                                                    <button
                                                        onClick={() => {
                                                            if (!replacementFile || !activeLetter) return;
                                                            setIsReplacingFile(true);
                                                            const formData = new FormData();
                                                            formData.append('file_draft', replacementFile);
                                                            router.post(
                                                                route('surat.replace-file', activeLetter.id),
                                                                formData,
                                                                {
                                                                    forceFormData: true,
                                                                    onFinish: () => {
                                                                        setIsReplacingFile(false);
                                                                        setReplacementFile(null);
                                                                    },
                                                                    onSuccess: () => {
                                                                        router.reload({ only: ['surat', 'previewUrl', 'flash'] });
                                                                    },
                                                                }
                                                            );
                                                        }}
                                                        disabled={isReplacingFile}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-all"
                                                    >
                                                        {isReplacingFile ? (
                                                            <>
                                                                <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>
                                                                <span>Mengupload...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                                </svg>
                                                                <span>Ganti File Draft</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* History Card */}
                                {activeLetter.approval_logs && activeLetter.approval_logs.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-205 text-sm">Riwayat Aktivitas</h3>
                                        </div>
                                        <div className="px-5 py-5">
                                            <div className="relative pl-1">
                                                {/* Vertical Line */}
                                                <div className="absolute left-[18px] top-2 bottom-6 w-[2px] bg-gray-200 dark:bg-gray-700"></div>

                                                <div className="space-y-0">
                                                    {activeLetter.approval_logs?.map((log, index) => {
                                                        const cfg = AKSI_CONFIG[log.aksi] ?? { label: log.aksi, color: 'text-gray-900 dark:text-white' };
                                                        const isLast = index === (activeLetter.approval_logs?.length ?? 0) - 1;

                                                        // Icons & Colors
                                                        let IconPath = "M5 13l4 4L19 7"; // Check (Disetujui)
                                                        let circleBg = "bg-emerald-50 dark:bg-emerald-900/30";
                                                        let iconColor = "text-emerald-500 dark:text-emerald-400";

                                                        if (log.aksi === 'diajukan') {
                                                            IconPath = "M12 4v16m8-8H4"; // Plus (Diajukan)
                                                            circleBg = "bg-gray-100 dark:bg-gray-800";
                                                            iconColor = "text-gray-500 dark:text-gray-400";
                                                        } else if (log.aksi === 'ditolak') {
                                                            IconPath = "M6 18L18 6M6 6l12 12"; // Cross (Ditolak)
                                                            circleBg = "bg-red-50 dark:bg-red-900/30";
                                                            iconColor = "text-red-500 dark:text-red-400";
                                                        }

                                                        return (
                                                            <div key={log.id} className={`relative flex items-start ${isLast ? '' : 'pb-7'}`}>
                                                                {/* Icon Circle */}
                                                                <div className={`relative z-10 w-7 h-7 rounded-full ${circleBg} flex items-center justify-center flex-shrink-0 ring-[5px] ring-white dark:ring-gray-800`}>
                                                                    <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d={IconPath} />
                                                                    </svg>
                                                                </div>

                                                                {/* Content */}
                                                                <div className="ml-5 pt-0.5">
                                                                    <h4 className="font-semibold text-[14px] text-gray-900 dark:text-white">
                                                                        {cfg.label}
                                                                    </h4>
                                                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                                                                        {formatDateTime(log.created_at)}
                                                                    </p>

                                                                    <p className="text-[13px] text-gray-700 dark:text-gray-300 mt-2">
                                                                        Aktivitas oleh <span className="font-semibold text-gray-900 dark:text-white">{log.user?.name ?? 'Sistem'}</span>.
                                                                        {log.catatan && (
                                                                            <span className="block mt-1">
                                                                                "{log.catatan}"
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
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
                                                disableDragging={!canSubmit}
                                                enableResizing={canSubmit}
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
            {/* ── Unauthorized Modal ── */}
            <ConfirmDialog
                open={showUnauthorizedModal}
                icon={
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                }
                iconBgClass="bg-red-100"
                title="Tidak Diizinkan"
                description="Anda tidak memiliki akses untuk mengganti file draft pada surat ini karena Anda bukan pembuat surat."
                cancelLabel="Tutup"
                confirmLabel="Mengerti"
                confirmBtnClass="bg-red-500 hover:bg-red-600"
                onCancel={() => setShowUnauthorizedModal(false)}
                onConfirm={() => setShowUnauthorizedModal(false)}
            />
        </AuthenticatedLayout>
    );
}
