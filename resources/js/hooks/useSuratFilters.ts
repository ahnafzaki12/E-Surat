import { useMemo, useState } from 'react';
import type { Surat, SuratStatus } from '../Types/surat';

export type SuratSortKey = 'perihal' | 'tanggal_surat' | 'approved_at' | 'status' | 'tujuan_surat' | 'jenis_surat' | 'nomor_surat_formatted';

export interface SuratSortConfig {
    key: SuratSortKey;
    direction: 'asc' | 'desc' | null;
}

interface UseSuratFiltersOptions {
    data: Surat[];
    searchQuery: string;
    status: SuratStatus | 'all';
}

const valueForSort = (surat: Surat, key: SuratSortKey): string => {
    if (key === 'jenis_surat') return surat.jenis_surat?.nama ?? '';

    return String(surat[key] ?? '');
};

export function useSuratFilters({ data, searchQuery, status }: UseSuratFiltersOptions) {
    const [sortConfig, setSortConfig] = useState<SuratSortConfig>({
        key: 'tanggal_surat',
        direction: 'desc',
    });

    const filteredSurats = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const results = data.filter((surat) => {
            const matchesStatus = status === 'all' || surat.status === status;
            const matchesQuery = !normalizedQuery || [
                surat.perihal,
                surat.tujuan_surat,
                surat.nomor_surat_formatted ?? '',
                surat.jenis_surat?.nama ?? '',
            ].some((value) => value.toLowerCase().includes(normalizedQuery));

            return matchesStatus && matchesQuery;
        });

        if (!sortConfig.direction) return results;

        return [...results].sort((left, right) => {
            const comparison = valueForSort(left, sortConfig.key).localeCompare(
                valueForSort(right, sortConfig.key),
                'id',
                { numeric: true, sensitivity: 'base' },
            );

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [data, searchQuery, sortConfig, status]);

    const toggleSort = (key: SuratSortKey) => {
        setSortConfig((current) => ({
            key,
            direction: current.key !== key || current.direction === null
                ? 'asc'
                : current.direction === 'asc'
                    ? 'desc'
                    : null,
        }));
    };

    return { filteredSurats, sortConfig, toggleSort };
}
