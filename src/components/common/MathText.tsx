/**
 * Component to render text with inline LaTeX formulas
 * Supports LaTeX formulas wrapped in $...$ delimiters
 */

'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = '' }: MathTextProps) {
  if (!text) return null;

  // Pattern to match LaTeX formulas: $...$ (inline math)
  // Matches $...$ but not $$...$$ (block math)
  const latexPattern = /(?<!\$)\$([^$]+)\$(?!\$)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  // Reset regex lastIndex
  latexPattern.lastIndex = 0;

  while ((match = latexPattern.exec(text)) !== null) {
    // Add text before the LaTeX formula
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(
          <span key={`text-${keyCounter++}`}>{textBefore}</span>
        );
      }
    }

    // Add the LaTeX formula
    try {
      parts.push(
        <InlineMath key={`math-${keyCounter++}`} math={match[1].trim()} />
      );
    } catch (error) {
      // If LaTeX rendering fails, show the original text
      console.warn('Failed to render LaTeX:', match[1], error);
      parts.push(
        <span key={`error-${keyCounter++}`} className="text-red-500">
          ${match[1]}$
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(
        <span key={`text-${keyCounter++}`}>{remainingText}</span>
      );
    }
  }

  // If no LaTeX formulas found, return plain text
  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return <span className={className}>{parts}</span>;
}

