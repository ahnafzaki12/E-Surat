import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
    /** Whether the dialog is visible */
    open: boolean;
    /** Icon element rendered inside the colored square */
    icon: React.ReactNode;
    /** Background color / gradient for the icon container (Tailwind class or inline style) */
    iconBgClass?: string;
    iconBgStyle?: React.CSSProperties;
    /** Dialog title */
    title: string;
    /** Optional description below the title */
    description?: React.ReactNode;
    /** Optional textarea for extra input (e.g., rejection reason) */
    extra?: React.ReactNode;
    /** Label for the cancel button */
    cancelLabel?: string;
    /** Label for the confirm button */
    confirmLabel?: string;
    /** Tailwind class for the confirm button background */
    confirmBtnClass?: string;
    /** Whether the confirm action is loading */
    isLoading?: boolean;
    /** Called when the user clicks Cancel or outside the dialog */
    onCancel: () => void;
    /** Called when the user clicks the confirm button */
    onConfirm: () => void;
    /** Disable confirm button (e.g., required field is empty) */
    confirmDisabled?: boolean;
}

export default function ConfirmDialog({
    open,
    icon,
    iconBgClass = 'bg-gray-100',
    iconBgStyle,
    title,
    description,
    extra,
    cancelLabel = 'Cancel',
    confirmLabel = 'Confirm',
    confirmBtnClass = 'bg-red-500 hover:bg-red-600',
    isLoading = false,
    onCancel,
    onConfirm,
    confirmDisabled = false,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(5px)' }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                ref={dialogRef}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm p-6"
                style={{ animation: 'confirm-pop 0.18s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
                <style>{`
                    @keyframes confirm-pop {
                        from { opacity: 0; transform: scale(0.92); }
                        to   { opacity: 1; transform: scale(1); }
                    }
                `}</style>

                <div className="flex items-center gap-4 mb-3">
                    {/* Icon square */}
                    <div
                        className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${iconBgClass}`}
                        style={iconBgStyle}
                    >
                        {icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                        {title}
                    </h3>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-1">
                        {description}
                    </p>
                )}

                {/* Optional extra content (e.g. textarea for rejection note) */}
                {extra && <div className="mt-4">{extra}</div>}

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-800 my-5" />

                {/* Actions — right-aligned like reference */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading || confirmDisabled}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-60 ${confirmBtnClass}`}
                    >
                        {isLoading && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
