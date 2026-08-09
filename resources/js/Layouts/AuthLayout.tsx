import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {(title || description) && (
                    <div className="text-center mb-8">
                        {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                        {description && <p className="text-gray-500 mt-2">{description}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
