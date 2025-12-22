/**
 * LaTeX Validation Utility
 * Validates LaTeX formulas in exercise fields and provides auto-fix capabilities
 */

import katex from 'katex';
import { SolutionStepRequest, CommonMistakeRequest } from '@/types/exercise';

export interface LaTeXError {
  field: string;
  location: string; // e.g., "solutionSteps[0].content"
  formula: string;
  error: string;
  suggestion?: string;
  autoFixable: boolean;
  fixedValue?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: LaTeXError[];
  autoFixableCount: number;
}

export interface AutoFixResult {
  fixed: string;
  fixes: string[];
}

// Pattern to match LaTeX formulas: $...$ (inline math)
// Matches $...$ but not $$...$$ (block math)
const LATEX_PATTERN = /(?<!\$)\$([^$]+)\$(?!\$)/g;

// Pattern to match other delimiters that should be converted
const DOUBLE_DOLLAR_PATTERN = /\$\$([^$]+)\$\$/g;
const PAREN_PATTERN = /\\\(([^)]+)\\\)/g;
const BRACKET_PATTERN = /\\\[([^\]]+)\\\]/g;

// Unsupported LaTeX commands that should be replaced
const UNSUPPORTED_COMMANDS: Record<string, string> = {
  '\\square': '?',
  '\\Box': '?',
  '\\blacksquare': '?',
};

/**
 * Extract all LaTeX formulas from text
 */
function extractLatexFormulas(text: string): Array<{ formula: string; startIndex: number; endIndex: number }> {
  const formulas: Array<{ formula: string; startIndex: number; endIndex: number }> = [];
  let match;

  // Reset regex
  LATEX_PATTERN.lastIndex = 0;

  while ((match = LATEX_PATTERN.exec(text)) !== null) {
    formulas.push({
      formula: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return formulas;
}

/**
 * Check if LaTeX formula has balanced braces
 */
function hasBalancedBraces(formula: string): boolean {
  let count = 0;
  for (const char of formula) {
    if (char === '{') count++;
    if (char === '}') count--;
    if (count < 0) return false;
  }
  return count === 0;
}

/**
 * Check if LaTeX formula has balanced parentheses
 */
function hasBalancedParentheses(formula: string): boolean {
  let count = 0;
  for (const char of formula) {
    if (char === '(') count++;
    if (char === ')') count--;
    if (count < 0) return false;
  }
  return count === 0;
}

/**
 * Try to render LaTeX formula with KaTeX to detect render errors
 */
function tryRenderLatex(formula: string): { success: boolean; error?: string } {
  try {
    katex.renderToString(formula, {
      throwOnError: true,
      strict: 'warn',
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Auto-fix LaTeX formula
 */
export function autoFixLaTeX(text: string): AutoFixResult {
  let fixed = text;
  const fixes: string[] = [];

  // Fix 1: Replace $$...$$ with $...$
  if (DOUBLE_DOLLAR_PATTERN.test(fixed)) {
    fixed = fixed.replace(DOUBLE_DOLLAR_PATTERN, (match, content) => `$${content}$`);
    fixes.push('Đã sửa delimiter $$...$$ thành $...$');
  }

  // Fix 2: Replace \(...\) with $...$
  if (PAREN_PATTERN.test(fixed)) {
    fixed = fixed.replace(PAREN_PATTERN, (match, content) => `$${content}$`);
    fixes.push('Đã sửa delimiter \\(...\\) thành $...$');
  }

  // Fix 3: Replace \[...\] with $...$
  if (BRACKET_PATTERN.test(fixed)) {
    fixed = fixed.replace(BRACKET_PATTERN, (match, content) => `$${content}$`);
    fixes.push('Đã sửa delimiter \\[...\\] thành $...$');
  }

  // Fix 4: Replace unsupported commands
  for (const [command, replacement] of Object.entries(UNSUPPORTED_COMMANDS)) {
    if (fixed.includes(command)) {
      fixed = fixed.replace(new RegExp(command.replace('\\', '\\\\'), 'g'), replacement);
      fixes.push(`Đã thay thế lệnh không hỗ trợ ${command} bằng ${replacement}`);
    }
  }

  // Fix 5: Escape backslashes (for JSON, but this is for display)
  // Note: This is handled at JSON serialization level, not here

  return { fixed, fixes };
}

/**
 * Validate LaTeX in a single text field (internal helper)
 */
function validateLaTeXInField(
  text: string,
  fieldName: string,
  location: string
): LaTeXError[] {
  const errors: LaTeXError[] = [];

  if (!text || !text.trim()) {
    return errors;
  }

  // Extract LaTeX formulas
  const formulas = extractLatexFormulas(text);

  // Check for formulas without delimiters (potential LaTeX without $...$)
  // This is a heuristic: look for common LaTeX patterns without delimiters
  const potentialLatexPattern = /\\[a-zA-Z]+\{/g;
  const allMatches = [...text.matchAll(potentialLatexPattern)];
  
  for (const match of allMatches) {
    // Check if this is not already inside a $...$ block
    const beforeMatch = text.substring(0, match.index);
    const dollarCount = (beforeMatch.match(/\$/g) || []).length;
    
    if (dollarCount % 2 === 0) {
      // Not inside a $...$ block, might be missing delimiter
      const start = Math.max(0, (match.index || 0) - 20);
      const end = Math.min(text.length, (match.index || 0) + 50);
      const snippet = text.substring(start, end);
      
      errors.push({
        field: fieldName,
        location,
        formula: snippet,
        error: 'Có thể thiếu delimiter $...$ cho công thức LaTeX',
        suggestion: 'Bao quanh công thức bằng $...$',
        autoFixable: false, // Too risky to auto-fix without delimiter
        fixedValue: undefined,
      });
    }
  }

  // Validate each extracted formula
  for (let i = 0; i < formulas.length; i++) {
    const { formula, startIndex } = formulas[i];
    const formulaLocation = `${location} (công thức ${i + 1})`;

    // Check balanced braces
    if (!hasBalancedBraces(formula)) {
      errors.push({
        field: fieldName,
        location: formulaLocation,
        formula,
        error: 'Dấu ngoặc nhọn không cân bằng',
        suggestion: 'Kiểm tra số lượng { và }',
        autoFixable: false,
        fixedValue: undefined,
      });
      continue;
    }

    // Check balanced parentheses
    if (!hasBalancedParentheses(formula)) {
      errors.push({
        field: fieldName,
        location: formulaLocation,
        formula,
        error: 'Dấu ngoặc đơn không cân bằng',
        suggestion: 'Kiểm tra số lượng ( và )',
        autoFixable: false,
        fixedValue: undefined,
      });
      continue;
    }

    // Try to render with KaTeX
    const renderResult = tryRenderLatex(formula);
    if (!renderResult.success) {
      // Check if it's a delimiter issue
      if (formula.includes('$$') || formula.includes('\\(') || formula.includes('\\[')) {
        const fixed = autoFixLaTeX(`$${formula}$`);
        errors.push({
          field: fieldName,
          location: formulaLocation,
          formula,
          error: `Lỗi render: ${renderResult.error}. Có thể do delimiter sai`,
          suggestion: 'Sử dụng delimiter $...$ thay vì $$...$$, \\(...\\), hoặc \\[...\\]',
          autoFixable: true,
          fixedValue: fixed.fixed,
        });
      } else {
        // Check for unsupported commands
        let hasUnsupported = false;
        for (const command of Object.keys(UNSUPPORTED_COMMANDS)) {
          if (formula.includes(command)) {
            const fixed = autoFixLaTeX(`$${formula}$`);
            errors.push({
              field: fieldName,
              location: formulaLocation,
              formula,
              error: `Lệnh ${command} không được KaTeX hỗ trợ`,
              suggestion: `Thay thế bằng ${UNSUPPORTED_COMMANDS[command]}`,
              autoFixable: true,
              fixedValue: fixed.fixed,
            });
            hasUnsupported = true;
            break;
          }
        }

        if (!hasUnsupported) {
          errors.push({
            field: fieldName,
            location: formulaLocation,
            formula,
            error: `Lỗi render LaTeX: ${renderResult.error}`,
            suggestion: 'Kiểm tra cú pháp LaTeX',
            autoFixable: false,
            fixedValue: undefined,
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Validate LaTeX in a single text string
 */
export function validateLaTeXInText(text: string): ValidationResult {
  const errors = validateLaTeXInField(text, 'text', 'text');
  const autoFixableCount = errors.filter((e) => e.autoFixable).length;

  return {
    isValid: errors.length === 0,
    errors,
    autoFixableCount,
  };
}

/**
 * Exercise form data type for validation
 */
export interface ExerciseFormDataForValidation {
  problemText?: string;
  problemLatex?: string;
  solutionSteps?: SolutionStepRequest[];
  finalAnswer?: string;
  commonMistakes?: CommonMistakeRequest[];
  hints?: string[];
}

/**
 * Validate LaTeX in all exercise fields
 */
export function validateExerciseLaTeX(exercise: ExerciseFormDataForValidation): ValidationResult {
  const allErrors: LaTeXError[] = [];

  // Validate problemText
  if (exercise.problemText) {
    const errors = validateLaTeXInField(exercise.problemText, 'problemText', 'problemText');
    allErrors.push(...errors);
  }

  // Validate problemLatex (should not have delimiters)
  if (exercise.problemLatex) {
    // problemLatex should not have $...$ delimiters
    if (exercise.problemLatex.includes('$')) {
      allErrors.push({
        field: 'problemLatex',
        location: 'problemLatex',
        formula: exercise.problemLatex,
        error: 'problemLatex không được chứa delimiter $...$',
        suggestion: 'Xóa các dấu $ trong problemLatex',
        autoFixable: true,
        fixedValue: exercise.problemLatex.replace(/\$/g, ''),
      });
    } else {
      // Validate as LaTeX formula (without delimiters)
      const renderResult = tryRenderLatex(exercise.problemLatex);
      if (!renderResult.success) {
        allErrors.push({
          field: 'problemLatex',
          location: 'problemLatex',
          formula: exercise.problemLatex,
          error: `Lỗi render LaTeX: ${renderResult.error}`,
          suggestion: 'Kiểm tra cú pháp LaTeX',
          autoFixable: false,
          fixedValue: undefined,
        });
      }
    }
  }

  // Validate solutionSteps
  if (exercise.solutionSteps) {
    exercise.solutionSteps.forEach((step, index) => {
      if (step.content) {
        const errors = validateLaTeXInField(
          step.content,
          'solutionSteps',
          `solutionSteps[${index}].content`
        );
        allErrors.push(...errors);
      }
      if (step.explanation) {
        const errors = validateLaTeXInField(
          step.explanation,
          'solutionSteps',
          `solutionSteps[${index}].explanation`
        );
        allErrors.push(...errors);
      }
    });
  }

  // Validate finalAnswer
  if (exercise.finalAnswer) {
    const errors = validateLaTeXInField(exercise.finalAnswer, 'finalAnswer', 'finalAnswer');
    allErrors.push(...errors);
  }

  // Validate commonMistakes
  if (exercise.commonMistakes) {
    exercise.commonMistakes.forEach((mistake, index) => {
      if (mistake.mistake) {
        const errors = validateLaTeXInField(
          mistake.mistake,
          'commonMistakes',
          `commonMistakes[${index}].mistake`
        );
        allErrors.push(...errors);
      }
      if (mistake.explanation) {
        const errors = validateLaTeXInField(
          mistake.explanation,
          'commonMistakes',
          `commonMistakes[${index}].explanation`
        );
        allErrors.push(...errors);
      }
    });
  }

  // Validate hints
  if (exercise.hints) {
    exercise.hints.forEach((hint, index) => {
      if (hint) {
        const errors = validateLaTeXInField(hint, 'hints', `hints[${index}]`);
        allErrors.push(...errors);
      }
    });
  }

  const autoFixableCount = allErrors.filter((e) => e.autoFixable).length;

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    autoFixableCount,
  };
}

