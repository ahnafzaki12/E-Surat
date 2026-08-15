import PageMeta from '../../components/common/PageMeta';

interface VerifyProps {
    surat: {
        nomor_surat_formatted: string;
        perihal: string;
        tujuan_surat: string;
        jenis_surat: string | null;
        approved_by: string | null;
        approved_at: string | null;
        download_url: string;
    };
}

const formatDateTime = (value: string | null) => value
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(value))
    : '—';

export default function Verify({ surat }: VerifyProps) {
    return (
        <>
            <PageMeta title="Verifikasi Dokumen | E-Surat" description="Verifikasi dokumen Yayasan PISSYA" />
            <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-14">
                <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-300/40">
                    <header className="bg-slate-900 px-6 py-7 text-white sm:px-10">
                        <p className="text-sm font-semibold tracking-[0.2em] text-emerald-300">YAYASAN PISSYA</p>
                        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">VERIFIKASI DOKUMEN</h1>
                    </header>

                    <div className="px-6 py-8 sm:px-10 sm:py-10">
                        <div className="flex flex-col items-center border-b border-slate-100 pb-8 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <svg className="h-11 w-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4.5 4.5L19 7" />
                                </svg>
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-slate-900">Dokumen Terverifikasi</h2>
                            <p className="mt-1 text-sm text-slate-500">Dokumen ini tercatat dan telah disetujui pada sistem E-Surat.</p>
                        </div>

                        <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status Dokumen</dt>
                                <dd className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">AKTIF</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nomor Surat</dt>
                                <dd className="mt-2 font-mono text-sm font-semibold text-slate-800">{surat.nomor_surat_formatted}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Jenis Surat</dt>
                                <dd className="mt-2 text-sm font-semibold text-slate-800">{surat.jenis_surat || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tujuan</dt>
                                <dd className="mt-2 text-sm font-semibold text-slate-800">{surat.tujuan_surat}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Keterangan</dt>
                                <dd className="mt-2 text-sm font-semibold text-slate-800">{surat.perihal}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Penandatangan</dt>
                                <dd className="mt-2 text-sm font-semibold text-slate-800">{surat.approved_by || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Waktu Persetujuan</dt>
                                <dd className="mt-2 text-sm font-semibold text-slate-800">{formatDateTime(surat.approved_at)}</dd>
                            </div>
                        </dl>

                        <a href={surat.download_url} className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                            </svg>
                            Download Dokumen
                        </a>
                    </div>

                    <footer className="border-t border-slate-100 px-6 py-5 text-center text-xs leading-relaxed text-slate-400 sm:px-10">
                        QR Code ini merupakan tautan verifikasi dokumen pada sistem E-Surat Yayasan PISSYA dan bukan tanda tangan elektronik tersertifikasi.
                    </footer>
                </section>
            </main>
        </>
    );
}
