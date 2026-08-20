import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/UI/table';
import Badge from '../../components/UI/badge/Badge';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, Plus, Search } from 'lucide-react';
import { statusConfiguration as STATUS_MAPPING } from '../../components/surat/StatusBadge';
import type { SuratStatus, PaginatedSurats } from '../../Types/surat';
import Pagination from '../../components/UI/pagination/Pagination';
import { SuratSortKey, useSuratFilters } from '../../Hooks/useSuratFilters';





interface PageProps {
    auth: { user: { id: number; name: string; email: string; role_id?: number; role?: { name: string; permissions?: string[] } } };
    surats: PaginatedSurats;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}


export default function SuratIndex() {
    const { surats, flash, auth } = usePage<PageProps>().props;

    const userPermissions = auth.user.role?.permissions || [];
    const isAdmin = auth.user.role?.name === 'admin';
    const canCreateSurat = isAdmin || userPermissions.includes('surat.create');

    const [searchQuery, setSearchQuery] = useState('');


    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<SuratStatus | 'all'>('all');
    const { filteredSurats, sortConfig, toggleSort } = useSuratFilters({
        data: surats.data,
        searchQuery,
        status: filterStatus,
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
            <PageMeta title="Daftar Surat | E-Surat" description="Daftar Surat Keluar dan Masuk Yayasan PISSYA" />
            <PageBreadcrumb pageTitle="Daftar Surat" />

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

                {/* ── Table Card ── */}
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
                                {canCreateSurat && (
                                    <button
                                        onClick={() => router.visit(route('surat.create'))}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-9 rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-4 text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        <Plus className="size-4 text-white" />
                                        <span className="hidden sm:inline">Upload Surat Baru</span>
                                        <span className="sm:hidden">Upload</span>
                                    </button>
                                )}
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
                                <div className="grid grid-cols-1 gap-5">
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
                                </div>
                                <div className="flex justify-end mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        onClick={() => {
                                            setFilterStatus('all');
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
                                const jenisSurat = surat.jenis_surat || surat.jenis_surat;
                                const dateStart = new Date(surat.tanggal_surat);
                                const formattedStartDay = dateStart.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                                const statusCfg = STATUS_MAPPING[surat.status];

                                return (
                                    <div
                                        key={surat.id}
                                        onClick={() => router.visit(route('surat.show', surat.id))}
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                                </svg>
                                                <span className="truncate max-w-[120px]">{surat.tujuan_surat || '—'}</span>
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
                                        const jenisSurat = surat.jenis_surat || surat.jenis_surat;
                                        const dateStart = new Date(surat.tanggal_surat);

                                        // Format tanggal surat
                                        const formattedStartDay = dateStart.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

                                        // Status mapping from E-Surat structure
                                        const statusCfg = STATUS_MAPPING[surat.status];

                                        return (
                                            <TableRow
                                                key={surat.id}
                                                onClick={() => router.visit(route('surat.show', surat.id))}
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
                                                                oleh {surat.tujuan_surat || '—'}
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
                    {surats.total > 0 && (
                        <div className="px-5 pb-5">
                            <Pagination
                                currentPage={surats.current_page}
                                totalItems={surats.total}
                                itemsPerPage={surats.per_page}
                                onPageChange={(page) => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set('page', page.toString());
                                    router.visit(url.toString(), { preserveScroll: true });
                                }}
                                onItemsPerPageChange={(perPage) => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set('per_page', perPage.toString());
                                    url.searchParams.set('page', '1');
                                    router.visit(url.toString(), { preserveScroll: true });
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
