export type SuratStatus = 'draft' | 'menunggu_persetujuan' | 'ditolak' | 'disetujui';

export interface UserSummary {
    id: number;
    name: string;
    email: string;
}

export interface JenisSurat {
    id: number;
    kode: string;
    nama: string;
}

export interface QrPosition {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ApprovalLog {
    id: number;
    aksi: string;
    catatan?: string | null;
    created_at: string;
    user?: UserSummary | null;
}

export interface SuratFile {
    original_name?: string;
    size?: number;
}

/** Data surat yang dikirim oleh Inertia dan endpoint detail surat. */
export interface Surat {
    id: number;
    nomor_surat_formatted: string | null;
    perihal: string;
    tujuan_surat: string;
    tanggal_surat: string;
    created_at: string;
    approved_at: string | null;
    status: SuratStatus;
    created_by: number;
    jenis_surat: JenisSurat | null;
    creator?: UserSummary | null;
    approver?: UserSummary | null;
    created_by_relation?: UserSummary | null;
    created_by_user?: UserSummary | null;
    approved_by_relation?: UserSummary | null;
    qr_position?: QrPosition | null;
    catatan_penolakan?: string | null;
    file_draft?: SuratFile | null;
    verification_token?: string | null;
    approval_logs?: ApprovalLog[];
}

export interface PaginatedSurats {
    data: Surat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
