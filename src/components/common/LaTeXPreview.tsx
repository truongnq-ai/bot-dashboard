/**
 * LaTeX Preview Component with Error Highlighting
 * Displays LaTeX formulas with error indicators
 */

'use client';

import React from 'react';
import MathText from './MathText';
import { LaTeXError } from '@/lib/utils/latex-validator';

interface LaTeXPreviewProps {
  text: string;
  errors?: LaTeXError[];
  showErrors?: boolean;
  className?: string;
}

export default function LaTeXPreview({
  text,
  errors = [],
  showErrors = true,
  className = '',
}: LaTeXPreviewProps) {
  if (!text) return null;

  // If no errors or not showing errors, just render normally
  if (!showErrors || errors.length === 0) {
    return <MathText text={text} className={className} />;
  }

  // Find errors that match this text field
  // For now, we'll show all errors if they exist
  // In practice, errors should be filtered by field/location

  return (
    <div className={`${className} relative`}>
      <MathText text={text} className={className} />
      {errors.length > 0 && (
        <div className="mt-1 flex items-start gap-1">
          <svg
            className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {errors.length} lỗi LaTeX
            </p>
            <div className="mt-1 space-y-1">
              {errors.slice(0, 3).map((error, index) => (
                <div
                  key={index}
                  className="text-xs text-red-600 dark:text-red-400"
                  title={error.suggestion}
                >
                  • {error.error}
                  {error.suggestion && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      ({error.suggestion})
                    </span>
                  )}
                </div>
              ))}
              {errors.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  và {errors.length - 3} lỗi khác...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

