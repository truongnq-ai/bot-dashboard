/**
 * Difficulty Badge Component
 */

'use client';

import React from 'react';
import { getDifficultyLabel } from '@/lib/utils/formatters';

interface DifficultyBadgeProps {
  difficulty?: number;
  className?: string;
}

export default function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  const getBadgeClass = (level: number): string => {
    switch (level) {
      case 1:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 2:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 3:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 4:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 5:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(
        difficulty || 0
      )} ${className}`}
    >
      {getDifficultyLabel(difficulty)}
    </span>
  );
}
