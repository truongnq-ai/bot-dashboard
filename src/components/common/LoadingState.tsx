/**
 * LoadingState Component
 * Reusable component for displaying loading states
 */

'use client';

import React from 'react';

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    fullHeight?: boolean;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
};

export default function LoadingState({
    message = 'Đang tải...',
    size = 'md',
    fullHeight = false,
}: LoadingStateProps) {
    const containerClasses = fullHeight
        ? 'flex items-center justify-center min-h-[400px]'
        : 'text-center py-8';

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-3">
                <svg
                    className={`animate-spin text-brand-600 dark:text-brand-400 ${sizeClasses[size]}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                {message && (
                    <p className="text-theme-sm text-gray-500 dark:text-gray-400">{message}</p>
                )}
            </div>
        </div>
    );
}
