/**
 * Exercise Status Badge Component - Phase 1
 */

import React from 'react';
import { ExerciseStatus } from '@/types/exercise';

interface ExerciseStatusBadgeProps {
    status: ExerciseStatus;
    className?: string;
}

export default function ExerciseStatusBadge({ status, className = '' }: ExerciseStatusBadgeProps) {
    const getStatusConfig = (status: ExerciseStatus) => {
        switch (status) {
            case ExerciseStatus.DRAFT:
                return {
                    label: 'Nháp',
                    bgColor: 'bg-warning-100',
                    textColor: 'text-warning-800',
                    darkBgColor: 'dark:bg-warning-900',
                    darkTextColor: 'dark:text-warning-300',
                };
            case ExerciseStatus.APPROVED:
                return {
                    label: 'Đã duyệt',
                    bgColor: 'bg-success-100',
                    textColor: 'text-success-800',
                    darkBgColor: 'dark:bg-success-900',
                    darkTextColor: 'dark:text-success-300',
                };
            default:
                return {
                    label: status,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    darkBgColor: 'dark:bg-gray-800',
                    darkTextColor: 'dark:text-gray-300',
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.darkBgColor} ${config.darkTextColor} ${className}`}
        >
            {config.label}
        </span>
    );
}
