import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';

interface PageProps {
    flash?: {
        error?: string;
        success?: string;
    };
    [key: string]: unknown;
}

export default function UnauthorizedModal() {
    const { flash } = usePage<PageProps>().props;
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (flash?.error === 'unauthorized') {
            setIsOpen(true);
        }
    }, [flash]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal Panel */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all dark:bg-gray-900 dark:border dark:border-gray-800 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-900 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                                Akses Ditolak
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Maaf, Anda tidak memiliki hak akses untuk membuka halaman atau melakukan tindakan ini.
                                    Silakan hubungi administrator jika Anda merasa ini adalah sebuah kesalahan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button at top right */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Footer Buttons */}
                <div className="bg-gray-50 px-4 py-3 dark:bg-gray-800/50 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:ml-3 sm:w-auto transition-colors"
                    >
                        Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}
