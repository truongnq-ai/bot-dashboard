/**
 * ErrorState Component
 * Reusable component for displaying error states
 */

'use client';

import React from 'react';

interface ErrorStateProps {
    title?: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'error' | 'warning';
}

export default function ErrorState({
    title,
    message,
    action,
    variant = 'error',
}: ErrorStateProps) {
    const variantClasses = {
        error: {
            container: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800',
            text: 'text-error-800 dark:text-error-400',
            title: 'text-error-900 dark:text-error-300',
        },
        warning: {
            container: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
            text: 'text-warning-800 dark:text-warning-400',
            title: 'text-warning-900 dark:text-warning-300',
        },
    };

    const classes = variantClasses[variant];

    return (
        <div
            className={`border rounded-lg p-4 ${classes.container}`}
        >
            {title && (
                <h3 className={`font-semibold mb-2 ${classes.title}`}>{title}</h3>
            )}
            <p className={classes.text}>{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
