import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/lib/utils';
const Input = React.forwardRef(({ className, type, error, errorText, variant = 'default', ...props }, ref) => {
    const variantClasses = {
        default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
        error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
        success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
    };
    return (_jsxs("div", { className: "relative w-full", children: [_jsx("input", { type: type, className: cn('flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', variantClasses[variant], className), ref: ref, ...props }), error && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errorText || error }))] }));
});
Input.displayName = "Input";
export { Input };
