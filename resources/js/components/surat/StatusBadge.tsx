import Badge from '../UI/badge/Badge';
import type { SuratStatus } from '../../Types/surat';

const statusConfiguration: Record<SuratStatus, { label: string; color: 'light' | 'warning' | 'error' | 'success' }> = {
    draft: { label: 'Draft', color: 'light' },
    menunggu_persetujuan: { label: 'Menunggu Persetujuan', color: 'warning' },
    ditolak: { label: 'Ditolak', color: 'error' },
    disetujui: { label: 'Disetujui', color: 'success' },
};

interface StatusBadgeProps {
    status: SuratStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const configuration = statusConfiguration[status];

    return (
        <Badge color={configuration.color} variant="light" size="sm">
            {configuration.label}
        </Badge>
    );
}

export { statusConfiguration };
