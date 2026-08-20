interface SpecimenQRProps {
    canSubmit?: boolean;
    approverName?: string;
    approvedAt?: string;
    verifyUrl?: string;
    showResizeHandle?: boolean;
}

export default function SpecimenQR({
    canSubmit = false,
    approverName = 'NAMA APPROVER',
    approvedAt = '04 Oktober 2024 14:42:50 WIB',
    verifyUrl = 'https://esurat.pissya.or.id',
    showResizeHandle = false
}: SpecimenQRProps) {
    return (
        <div 
            className="w-full h-full relative group bg-white overflow-hidden pointer-events-none border border-black"
            style={{ containerType: 'size' } as React.CSSProperties}
        >
            <div className="flex items-center h-full" style={{ padding: '4cqh' }}>
                {/* QR Placeholder Box */}
                <div 
                    className="h-full aspect-square flex items-center justify-center shrink-0 relative"
                >
                    {/* Fake QR code pattern with tight viewBox to remove internal margin */}
                    <svg className="w-full h-full text-black" viewBox="3 3 18 18" fill="currentColor">
                        <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z" />
                    </svg>
                    {/* Logo in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-[1cqh] flex items-center justify-center">
                            <img src="/favicon.png" alt="Logo" className="w-[30cqh] h-[30cqh] object-contain" />
                        </div>
                    </div>
                </div>
                
                {/* Core Info Texts */}
                <div 
                    className="flex flex-col h-full flex-1 justify-center min-w-0 font-sans tracking-tight" 
                    style={{ marginLeft: '4cqh', lineHeight: '1' }}
                >
                    <div className="flex flex-col justify-start" style={{ marginBottom: '4cqh' }}>
                        <p className="text-black truncate" style={{ fontSize: '9cqh' }}>TTE oleh :</p>
                        <p className="font-bold text-black truncate uppercase" style={{ fontSize: '10cqh', marginTop: '0.5cqh' }}>{approverName}</p>
                        <p className="text-black truncate" style={{ fontSize: '9cqh', marginTop: '0.5cqh' }}>{approvedAt}</p>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-black truncate" style={{ fontSize: '9cqh' }}>Verifikasi melalui</p>
                        <p className="text-black truncate" style={{ fontSize: '9cqh', marginTop: '0.5cqh' }}>{verifyUrl}</p>
                    </div>
                </div>
            </div>

            {canSubmit && (
                <>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-400/50 pointer-events-none transition-colors" />
                    {showResizeHandle && (
                        <div className="absolute right-0 bottom-0 w-3 h-3 bg-indigo-500 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ cursor: 'nwse-resize' }} />
                    )}
                </>
            )}
        </div>
    );
}
