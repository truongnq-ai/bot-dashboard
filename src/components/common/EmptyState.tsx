/**
 * EmptyState Component
 * Reusable component for displaying empty states
 */

'use client';

import React from 'react';

interface EmptyStateProps {
    title?: string;
    message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            {title && (
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {message}
            </p>
        </div>
    );
}
