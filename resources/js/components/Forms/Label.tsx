import { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    value?: string;
}

export default function Label({ value, className = '', children, ...props }: LabelProps) {
    return (
        <label {...props} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
            {value ? value : children}
        </label>
    );
}
