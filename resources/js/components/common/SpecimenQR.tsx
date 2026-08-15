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
        <div className="w-full h-full flex flex-col pointer-events-none pb-1 sm:pb-1.5 border-b-[0.5px] border-b-gray-400 dark:border-b-gray-600 relative">
            <div className="flex gap-2 sm:gap-3 items-center h-full pt-1 sm:pt-1.5">
                <div className="h-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border-[0.5px] border-gray-300 dark:border-gray-700">
                    <svg className="w-full h-full text-gray-700 dark:text-gray-300 p-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                </div>
                <div className="flex flex-col flex-1 justify-center min-w-0 font-sans tracking-tight leading-[1.1]">
                    <p className="text-[4.5px] sm:text-[5px] text-gray-800 dark:text-gray-200 truncate">TTE oleh :</p>
                    <p className="text-[4.5px] sm:text-[5px] font-bold text-gray-900 dark:text-white truncate uppercase">{approverName}</p>
                    <p className="text-[4.5px] sm:text-[5px] text-gray-800 dark:text-gray-200 truncate mb-2 sm:mb-3">{approvedAt}</p>
                    
                    <p className="text-[4.5px] sm:text-[5px] text-gray-800 dark:text-gray-200 truncate">Verifikasi melalui</p>
                    <p className="text-[4.5px] sm:text-[5px] text-gray-800 dark:text-gray-200 truncate font-medium">{verifyUrl}</p>
                </div>
            </div>

            {canSubmit && (
                <>
                    <div className="absolute inset-0 border border-transparent group-hover:border-indigo-400/50 pointer-events-none transition-colors" />
                    {showResizeHandle && (
                        <div className="absolute right-0 bottom-0 w-3 h-3 bg-indigo-500 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ cursor: 'nwse-resize' }} />
                    )}
                </>
            )}
        </div>
    );
}
