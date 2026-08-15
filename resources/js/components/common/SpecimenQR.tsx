interface SpecimenQRProps {
    canSubmit?: boolean;
    approverName?: string;
    showResizeHandle?: boolean;
}

export default function SpecimenQR({
    canSubmit = false,
    approverName = 'Nama Approver',
    showResizeHandle = false
}: SpecimenQRProps) {
    return (
        <div className="w-full h-full flex flex-col pointer-events-none p-1 sm:p-1.5 border border-transparent">
            <div className="flex gap-1 sm:gap-1.5 items-center h-full">
                <div className="h-full aspect-square bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center p-0.5 sm:p-1 border border-gray-300 dark:border-gray-700 shrink-0">
                    <svg className="w-full h-full text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                </div>
                <div className="flex flex-col flex-1 justify-center min-w-0">
                    <p className="text-[5px] sm:text-[6.5px] font-bold text-gray-800 dark:text-white truncate tracking-tight">Ditandatangani secara elektronik</p>
                    <p className="text-[4.5px] sm:text-[5.5px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-medium">Oleh: {approverName}</p>
                    <p className="text-[4px] sm:text-[5px] text-gray-400 dark:text-gray-500 truncate mt-0.5">esurat.pissya.or.id</p>
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
