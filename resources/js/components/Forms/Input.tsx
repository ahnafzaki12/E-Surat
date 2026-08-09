import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    rightElement?: ReactNode;
}

export default forwardRef<HTMLInputElement, InputProps>(function Input(
    { type = 'text', className = '', rightElement, ...props },
    ref
) {
    return (
        <div className="relative">
            <input
                {...props}
                type={type}
                ref={ref}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${rightElement ? 'pr-10' : ''} ${className}`}
            />
            {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {rightElement}
                </div>
            )}
        </div>
    );
});
