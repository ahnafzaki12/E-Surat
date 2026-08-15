import { router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Badge from '../../components/ui/badge/Badge';
import SpecimenQR from '../../components/common/SpecimenQR';
import Label from '../../components/form/Label';
import InputField from '../../components/form/input/InputField';
import { Upload, FileText, ClipboardCheck, CheckCircle2, ChevronLeft, ArrowRight, Eye, Calendar, Building, Landmark, Sliders, ChevronRight } from 'lucide-react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Rnd } from 'react-rnd';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface JenisSurat {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    qr_position_default: Record<string, any> | null;
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
    qr_position: {
        page: number;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
};

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1.5 text-xs text-error-500 flex items-center gap-1"><span>⚠</span>{message}</p>;
}

export default function SuratCreate() {
    const { jenisSurats } = usePage<PageProps>().props;
    const [activeStep, setActiveStep] = useState(1);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const { data, setData, processing, errors, reset } = useForm<FormData>({
        nomor_surat: '',
        jenis_surat_id: '',
        lembaga: '',
        perihal: '',
        tanggal_surat: '',
        file_draft: null,
        qr_position: null,
    });

    // File Upload States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewFileName, setPreviewFileName] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // PDF View States
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [renderedWidth, setRenderedWidth] = useState<number>(0);
    const [renderedHeight, setRenderedHeight] = useState<number>(0);

    // Specimen pixels state
    const [badgeState, setBadgeState] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    // Local coordinates state
    const [qrPosition, setQrPosition] = useState({
        page: 1,
        x: 0.59,
        y: 0.81,
        width: 0.32,
        height: 0.07
    });

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

        // Clean URL before creating new one
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(URL.createObjectURL(file));

        // Clear local error
        if (localErrors.file_draft) {
            setLocalErrors(prev => {
                const next = { ...prev };
                delete next.file_draft;
                return next;
            });
        }
    };

    // Initialize Default QR Position when Jenis Surat is selected
    useEffect(() => {
        if (data.jenis_surat_id) {
            const selected = jenisSurats.find(js => js.id.toString() === data.jenis_surat_id);
            if (selected && selected.qr_position_default) {
                const def = selected.qr_position_default;
                setQrPosition({
                    page: def.page || 1,
                    x: def.x ?? 0.59,
                    y: def.y ?? 0.81,
                    width: def.width ?? 0.32,
                    height: def.height ?? 0.07
                });
                setPageNumber(def.page || 1);
            }
        }
    }, [data.jenis_surat_id, jenisSurats]);

    // Handle updates of rendered page size
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
        if (renderedWidth === 0 || renderedHeight === 0) return;
        const newX = d.x / renderedWidth;
        const newY = d.y / renderedHeight;
        setQrPosition(prev => ({ ...prev, x: newX, y: newY }));
        setBadgeState(prev => ({ ...prev, x: d.x, y: d.y }));
    };

    const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement, _delta: any, position: { x: number, y: number }) => {
        if (renderedWidth === 0 || renderedHeight === 0) return;
        const newW = parseFloat(ref.style.width) / renderedWidth;
        const newH = parseFloat(ref.style.height) / renderedHeight;
        const newX = position.x / renderedWidth;
        const newY = position.y / renderedHeight;
        setQrPosition({ page: pageNumber, x: newX, y: newY, width: newW, height: newH });
        setBadgeState({ x: position.x, y: position.y, width: parseFloat(ref.style.width), height: parseFloat(ref.style.height) });
    };

    // Navigation and validation
    const handleNextToStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!data.file_draft) newErrors.file_draft = 'Dokumen PDF wajib diunggah.';
        if (!data.nomor_surat.trim()) newErrors.nomor_surat = 'Nomor Surat wajib diisi.';
        if (!data.jenis_surat_id) newErrors.jenis_surat_id = 'Jenis Surat wajib dipilih.';
        if (!data.lembaga.trim()) newErrors.lembaga = 'Lembaga/Tujuan wajib diisi.';
        if (!data.perihal.trim()) newErrors.perihal = 'Perihal wajib diisi.';
        if (!data.tanggal_surat) newErrors.tanggal_surat = 'Tanggal Surat wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setLocalErrors(newErrors);
            return;
        }

        setLocalErrors({});
        setActiveStep(2);
    };

    const handleNextToStep3 = () => {
        // Save coordinates into form state
        setData('qr_position', qrPosition);
        setActiveStep(3);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure latest coordinate state is saved
        const finalData = {
            ...data,
            qr_position: qrPosition
        };

        // We temporarily set data and perform submit
        router.post(route('surat.store'), finalData as any, {
            forceFormData: true,
            onSuccess: () => {
                setActiveStep(4);
            },
        });
    };

    const handleFieldChange = (field: keyof FormData, value: any) => {
        setData(field, value);
        if (localErrors[field]) {
            setLocalErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const getSelectedJenisSuratLabel = () => {
        const selected = jenisSurats.find(js => js.id.toString() === data.jenis_surat_id);
        return selected ? `[${selected.kode}] ${selected.nama}` : '—';
    };

    const stepperItems = [
        {
            step: 1,
            title: "Upload & Isi Detail",
            desc: "Unggah PDF & metadata surat",
            icon: <Upload className="w-5 h-5" />,
        },
        {
            step: 2,
            title: "Pengaturan TTD",
            desc: "Atur posisi QR Code spesimen",
            icon: <Sliders className="w-5 h-5" />,
        },
        {
            step: 3,
            title: "Ringkasan",
            desc: "Periksa kelengkapan draft",
            icon: <ClipboardCheck className="w-5 h-5" />,
        },
        {
            step: 4,
            title: "Selesai",
            desc: "Surat berhasil disimpan",
            icon: <CheckCircle2 className="w-5 h-5" />,
        },
    ];

    return (
        <AuthenticatedLayout>
            <PageMeta title="Upload Surat Baru | E-Surat" description="Upload Surat Baru Yayasan PISSYA" />
            <PageBreadcrumb pageTitle="Upload Surat Baru" items={[{ name: "Daftar Surat", path: "/surat" }]} />

            <div className="max-w-5xl mx-auto py-6 px-4">

                {/* ── Stepper Header ── */}
                <div className="mb-12 relative">
                    <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 dark:text-white mb-8">
                        Alur Pengunggahan Surat Baru
                    </h3>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-6 left-[12%] right-[12%] h-[2px] bg-gray-200 dark:bg-gray-800 hidden md:block z-0">
                            <div
                                className="absolute top-0 left-0 h-full bg-brand-500 transition-all duration-500"
                                style={{ width: `${Math.max(0, (activeStep - 1) * 33.33)}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                            {stepperItems.map((item) => {
                                const isCompleted = item.step < activeStep;
                                const isCurrent = item.step === activeStep;

                                let nodeClasses = "";
                                if (isCompleted) {
                                    nodeClasses = "bg-brand-500 border-brand-500 text-white shadow-brand-500/20";
                                } else if (isCurrent) {
                                    nodeClasses = "bg-white border-brand-500 text-brand-500 dark:bg-gray-900 dark:border-brand-500 shadow-md";
                                } else {
                                    nodeClasses = "bg-white border-gray-200 text-gray-400 dark:bg-gray-900 dark:border-gray-800";
                                }

                                return (
                                    <div key={item.step} className="flex flex-col items-center text-center">
                                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold mb-3 shadow-sm relative z-10 transition-all duration-300 ${nodeClasses}`}>
                                            {item.icon}
                                        </div>
                                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-[160px] hidden md:block">
                                            {item.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Main Form Wizard Card ── */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden relative">
                        {/* Brand Line Indicator */}
                        <div className="absolute top-0 left-0 right-0 h-[4px] bg-brand-500"></div>

                        <div className="p-6 sm:p-10">

                            {/* ── STEP 1: UPLOAD & METADATA ── */}
                            {activeStep === 1 && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Langkah 1: Unggah Dokumen & Isi Detail</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lengkapi berkas PDF dan isi detail informasi surat di bawah.</p>
                                    </div>

                                    {/* Upload PDF Section */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${isDragging
                                            ? 'border-brand-400 bg-brand-50/30 scale-[1.01] dark:bg-brand-950/10'
                                            : previewFileName
                                                ? 'border-success-300 bg-success-50/20 dark:bg-success-950/5'
                                                : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/10 dark:border-gray-800 dark:hover:border-brand-800 dark:hover:bg-white/[0.01]'
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            setFile(e.dataTransfer.files[0]);
                                        }}
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
                                                <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-950/20 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-success-600 dark:text-success-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-success-700 dark:text-success-400 text-sm">{previewFileName}</p>
                                                    <p className="text-xs text-success-600 dark:text-success-500 mt-0.5">{fileSize} · Klik untuk ganti berkas</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center">
                                                    <Upload className="w-5 h-5 text-brand-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-750 dark:text-gray-300 text-sm">Tarik & lepas file PDF surat di sini</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">atau klik untuk memilih file · Maks. 10 MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <FieldError message={localErrors.file_draft || errors.file_draft} />

                                    {/* Metadata Form */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        {/* Nomor Surat */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="nomor_surat">Nomor Surat <span className="text-red-500">*</span></Label>
                                            <InputField
                                                id="nomor_surat"
                                                type="text"
                                                value={data.nomor_surat}
                                                onChange={(e) => handleFieldChange('nomor_surat', e.target.value)}
                                                placeholder="Contoh: 59/YA-PISSYA/VII/2026"
                                                error={!!localErrors.nomor_surat || !!errors.nomor_surat}
                                            />
                                            <FieldError message={localErrors.nomor_surat || errors.nomor_surat} />
                                        </div>

                                        {/* Jenis Surat */}
                                        <div>
                                            <Label htmlFor="jenis_surat_id">Jenis Surat <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <select
                                                    id="jenis_surat_id"
                                                    value={data.jenis_surat_id}
                                                    onChange={(e) => handleFieldChange('jenis_surat_id', e.target.value)}
                                                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm appearance-none bg-transparent focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 text-gray-800 dark:text-white/90 dark:bg-gray-900 ${localErrors.jenis_surat_id || errors.jenis_surat_id
                                                        ? 'border-error-500 dark:border-error-550'
                                                        : 'border-gray-300 dark:border-gray-700'
                                                        }`}
                                                >
                                                    <option value="" className="text-gray-400 dark:bg-gray-900">— Pilih jenis surat —</option>
                                                    {jenisSurats.map((js) => (
                                                        <option key={js.id} value={js.id} className="text-gray-750 dark:bg-gray-900">
                                                            [{js.kode}] {js.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </div>
                                            <FieldError message={localErrors.jenis_surat_id || errors.jenis_surat_id} />
                                        </div>

                                        {/* Tanggal Surat */}
                                        <div>
                                            <Label htmlFor="tanggal_surat">Tanggal Surat <span className="text-red-500">*</span></Label>
                                            <InputField
                                                id="tanggal_surat"
                                                type="date"
                                                value={data.tanggal_surat}
                                                onChange={(e) => handleFieldChange('tanggal_surat', e.target.value)}
                                                error={!!localErrors.tanggal_surat || !!errors.tanggal_surat}
                                            />
                                            <FieldError message={localErrors.tanggal_surat || errors.tanggal_surat} />
                                        </div>

                                        {/* Lembaga / Tujuan */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="lembaga">Lembaga / Tujuan <span className="text-red-500">*</span></Label>
                                            <InputField
                                                id="lembaga"
                                                type="text"
                                                value={data.lembaga}
                                                onChange={(e) => handleFieldChange('lembaga', e.target.value)}
                                                placeholder="Contoh: YAYASAN PONDOK PESANTREN ISLAMIYAH SYAFI'IYAH"
                                                error={!!localErrors.lembaga || !!errors.lembaga}
                                            />
                                            <FieldError message={localErrors.lembaga || errors.lembaga} />
                                        </div>

                                        {/* Perihal */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="perihal">Perihal <span className="text-red-500">*</span></Label>
                                            <InputField
                                                id="perihal"
                                                type="text"
                                                value={data.perihal}
                                                onChange={(e) => handleFieldChange('perihal', e.target.value)}
                                                placeholder="Contoh: Undangan Rapat Koordinasi Tahunan"
                                                error={!!localErrors.perihal || !!errors.perihal}
                                            />
                                            <FieldError message={localErrors.perihal || errors.perihal} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <button
                                            type="button"
                                            onClick={handleNextToStep2}
                                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 bg-brand-500 hover:bg-brand-600"
                                        >
                                            Atur Posisi TTD
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: PENGATURAN TTD DIGITAL ── */}
                            {activeStep === 2 && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Langkah 2: Tentukan Letak QR Code Tanda Tangan</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Seret (drag) dan ubah ukuran kotak spesimen di bawah ini pada halaman dokumen yang Anda kehendaki.
                                        </p>
                                    </div>

                                    {/* PDF Placement Editor Workspace */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                                        {/* Controls */}
                                        <div className="lg:col-span-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Navigasi Halaman</span>

                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    type="button"
                                                    disabled={pageNumber <= 1}
                                                    onClick={() => {
                                                        const p = pageNumber - 1;
                                                        setPageNumber(p);
                                                        setQrPosition(prev => ({ ...prev, page: p }));
                                                    }}
                                                    className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-40"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                </button>
                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                    Hal. {pageNumber} dari {numPages || '—'}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={pageNumber >= numPages}
                                                    onClick={() => {
                                                        const p = pageNumber + 1;
                                                        setPageNumber(p);
                                                        setQrPosition(prev => ({ ...prev, page: p }));
                                                    }}
                                                    className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-40"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                </button>
                                            </div>

                                            <div className="border-t border-gray-150 dark:border-gray-800 pt-3 space-y-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                <p>Kotak biru mewakili QR Code sertifikasi tanda tangan digital.</p>
                                                <p>Posisi saat ini: <strong>Halaman {qrPosition.page}</strong></p>
                                                <p>Dimensi: <strong>{Math.round(qrPosition.width * 100)}% x {Math.round(qrPosition.height * 100)}%</strong></p>
                                            </div>
                                        </div>

                                        {/* PDF Canvas Viewport */}
                                        <div className="lg:col-span-8 flex justify-center bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 overflow-auto max-h-[500px]">
                                            <div className="relative shadow-sm bg-white dark:bg-gray-900" style={{ width: renderedWidth || 'auto', height: renderedHeight || 'auto' }}>
                                                {pdfUrl && (
                                                    <Document
                                                        file={pdfUrl}
                                                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                                        loading={<div className="p-8 text-sm text-gray-400">Memuat berkas PDF...</div>}
                                                    >
                                                        <Page
                                                            pageNumber={pageNumber}
                                                            onRenderSuccess={(page) => {
                                                                const viewport = page.getViewport({ scale: 1 });
                                                                const w = 450;
                                                                const h = w * (viewport.height / viewport.width);
                                                                setRenderedWidth(w);
                                                                setRenderedHeight(h);
                                                                updateBadgePixels(w, h, qrPosition.x, qrPosition.y, qrPosition.width, qrPosition.height);
                                                            }}
                                                            width={450}
                                                            renderTextLayer={false}
                                                            renderAnnotationLayer={false}
                                                            loading={<div className="p-8 text-sm text-gray-400">Merender halaman...</div>}
                                                        />
                                                    </Document>
                                                )}

                                                {renderedWidth > 0 && renderedHeight > 0 && pageNumber === qrPosition.page && (
                                                    <Rnd
                                                        size={{ width: badgeState.width, height: badgeState.height }}
                                                        position={{ x: badgeState.x, y: badgeState.y }}
                                                        onDragStop={handleDragStop}
                                                        onResizeStop={handleResizeStop}
                                                        bounds="parent"
                                                        lockAspectRatio={2.6}
                                                        enableResizing={true}
                                                        className="absolute z-20 rounded shadow-md bg-white/90 overflow-hidden border-2 border-brand-500 cursor-move group select-none"
                                                    >
                                                        <SpecimenQR canSubmit={true} />
                                                    </Rnd>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep(1)}
                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 transition"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Kembali
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextToStep3}
                                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 bg-brand-500 hover:bg-brand-600"
                                        >
                                            Lanjut ke Ringkasan
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                </div>
                            )}

                            {/* ── STEP 3: RINGKASAN & SUBMIT ── */}
                            {activeStep === 3 && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Langkah 3: Konfirmasi Ringkasan Surat</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Periksa kembali berkas dan informasi koordinat tanda tangan sebelum disimpan ke sistem.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* PDF Info Card */}
                                        <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-25/50 dark:bg-gray-900/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/20 text-brand-500 shrink-0">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Berkas Draft PDF</span>
                                                    <span className="font-semibold text-gray-855 dark:text-gray-300 text-sm block truncate">{previewFileName}</span>
                                                </div>
                                            </div>
                                            <Badge color="info" size="sm" variant="light">{fileSize}</Badge>
                                        </div>

                                        {/* Detail Table */}
                                        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                                            {/* Nomor Surat */}
                                            <div className="grid grid-cols-3 p-4">
                                                <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Nomor Surat</span>
                                                <span className="col-span-2 text-xs sm:text-sm font-semibold text-gray-800 dark:text-white font-mono break-all">{data.nomor_surat}</span>
                                            </div>

                                            {/* Jenis Surat */}
                                            <div className="grid grid-cols-3 p-4">
                                                <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Jenis Surat</span>
                                                <span className="col-span-2 text-xs sm:text-sm font-semibold text-gray-850 dark:text-white">{getSelectedJenisSuratLabel()}</span>
                                            </div>

                                            {/* Tanggal Surat */}
                                            <div className="grid grid-cols-3 p-4">
                                                <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Tanggal Surat</span>
                                                <span className="col-span-2 text-xs sm:text-sm font-semibold text-gray-855 dark:text-white">
                                                    {new Date(data.tanggal_surat).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            {/* Lembaga */}
                                            <div className="grid grid-cols-3 p-4">
                                                <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Building className="w-4 h-4" /> Lembaga / Tujuan</span>
                                                <span className="col-span-2 text-xs sm:text-sm font-semibold text-gray-855 dark:text-white leading-relaxed">{data.lembaga}</span>
                                            </div>

                                            {/* Perihal */}
                                            <div className="grid grid-cols-3 p-4">
                                                <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Landmark className="w-4 h-4" /> Perihal</span>
                                                <span className="col-span-2 text-xs sm:text-sm font-semibold text-gray-855 dark:text-white leading-relaxed">{data.perihal}</span>
                                            </div>

                                            {/* Posisi QR Code */}
                                            <div className="grid grid-cols-3 p-4 bg-brand-25/30 dark:bg-brand-950/5">
                                                <span className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">Letak QR TTD</span>
                                                <span className="col-span-2 text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-350">
                                                    Halaman {qrPosition.page} (Koordinat X: {Math.round(qrPosition.x * 100)}%, Y: {Math.round(qrPosition.y * 100)}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => setActiveStep(2)}
                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 transition disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Kembali
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 bg-brand-500 hover:bg-brand-600 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Mengajukan...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                                    </svg>
                                                    Ajukan ke Approver
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 4: SELESAI (FALLBACK) ── */}
                            {activeStep === 4 && (
                                <div className="space-y-6 text-center animate-in fade-in duration-200 py-6">
                                    <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-500 flex items-center justify-center mx-auto shadow-md">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Surat Berhasil Diajukan!</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                            Surat beserta koordinat spesimen tanda tangan digital berhasil dikirimkan ke approver.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-3 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => router.visit(route('surat.index'))}
                                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 transition"
                                        >
                                            Lihat Daftar Surat
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                reset();
                                                setPreviewFileName(null);
                                                setFileSize(null);
                                                if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                                                setPdfUrl(null);
                                                setActiveStep(1);
                                            }}
                                            className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition bg-brand-500 hover:bg-brand-600"
                                        >
                                            Unggah Surat Baru
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}