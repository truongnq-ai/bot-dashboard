/**
 * Type definitions for react-katex
 * This module doesn't have official TypeScript definitions
 */

declare module 'react-katex' {
  import { ComponentType, ReactNode } from 'react';

  export interface MathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    throwOnError?: boolean;
    display?: boolean;
    strict?: boolean | 'warn' | 'ignore';
    trust?: boolean | ((context: any) => boolean);
    macros?: Record<string, string>;
    colorIsTextColor?: boolean;
    fleqn?: boolean;
    leqno?: boolean;
  }

  export interface BlockMathProps extends MathProps {
    math: string;
  }

  export interface InlineMathProps extends MathProps {
    math: string;
  }

  export const BlockMath: ComponentType<BlockMathProps>;
  export const InlineMath: ComponentType<InlineMathProps>;
}

