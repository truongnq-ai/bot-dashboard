/**
 * JSON Validator for Exercise Import
 * Validates AI response format and converts to CreateExerciseRequest
 */

import { CreateExerciseRequest, SolutionStepRequest, CommonMistakeRequest } from '@/types/exercise';

interface AIExerciseResponse {
  problemText: string;
  problemLatex?: string | null;
  solutionSteps: Array<{
    stepNumber: number;
    description?: string;
    content: string;
    explanation?: string;
  }>;
  finalAnswer?: string;
  commonMistakes?: Array<{
    mistake: string;
    explanation?: string;
  }>;
  hints?: string[];
  learningObjective?: string;
  difficultyLevel?: number;
  timeEstimateSec?: number;
}

interface AIResponseFormat {
  exercises: AIExerciseResponse[];
}

export interface ValidationResult {
  valid: boolean;
  exercise?: CreateExerciseRequest;
  errors: string[];
}

/**
 * Normalize snake_case keys to camelCase in an object recursively
 */
function normalizeToCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(normalizeToCamelCase);
  }

  if (typeof obj === 'object') {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      normalized[camelKey] = normalizeToCamelCase(value);
    }
    return normalized;
  }

  return obj;
}

/**
 * Validate JSON string and convert AI response format to CreateExerciseRequest
 */
export function validateExerciseJson(jsonString: string): ValidationResult {
  const errors: string[] = [];

  // Step 1: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      valid: false,
      errors: [`JSON không hợp lệ: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`],
    };
  }

  // Normalize snake_case to camelCase (to support both formats from AI service)
  parsed = normalizeToCamelCase(parsed);

  // Step 2: Check structure - must have exercises array
  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      errors: ['JSON phải là một object'],
    };
  }

  const data = parsed as Record<string, unknown>;

  if (!('exercises' in data)) {
    return {
      valid: false,
      errors: ['JSON phải có trường "exercises"'],
    };
  }

  if (!Array.isArray(data.exercises)) {
    return {
      valid: false,
      errors: ['Trường "exercises" phải là một mảng'],
    };
  }

  // Step 3: Check exercises.length === 1
  if (data.exercises.length === 0) {
    return {
      valid: false,
      errors: ['Mảng "exercises" không được để trống'],
    };
  }

  if (data.exercises.length > 1) {
    return {
      valid: false,
      errors: ['Chỉ cho phép 1 bài tập trong mảng "exercises"'],
    };
  }

  const exercise = data.exercises[0] as unknown;

  // Step 4: Validate exercise object
  if (!exercise || typeof exercise !== 'object') {
    return {
      valid: false,
      errors: ['Bài tập phải là một object'],
    };
  }

  const ex = exercise as Record<string, unknown>;

  // Validate problemText (required)
  if (!('problemText' in ex) || typeof ex.problemText !== 'string' || !ex.problemText.trim()) {
    errors.push('Trường "problemText" là bắt buộc và không được để trống');
  }

  // Validate solutionSteps (required, array, min 1 item)
  if (!('solutionSteps' in ex)) {
    errors.push('Trường "solutionSteps" là bắt buộc');
  } else if (!Array.isArray(ex.solutionSteps)) {
    errors.push('Trường "solutionSteps" phải là một mảng');
  } else if (ex.solutionSteps.length === 0) {
    errors.push('Trường "solutionSteps" phải có ít nhất 1 bước giải');
  } else {
    // Validate each solution step
    (ex.solutionSteps as unknown[]).forEach((step, index) => {
      if (!step || typeof step !== 'object') {
        errors.push(`Bước giải thứ ${index + 1} phải là một object`);
        return;
      }

      const stepObj = step as Record<string, unknown>;

      if (!('stepNumber' in stepObj) || typeof stepObj.stepNumber !== 'number') {
        errors.push(`Bước giải thứ ${index + 1}: "stepNumber" là bắt buộc và phải là số`);
      }

      if (!('content' in stepObj) || typeof stepObj.content !== 'string' || !stepObj.content.trim()) {
        errors.push(`Bước giải thứ ${index + 1}: "content" là bắt buộc và không được để trống`);
      }
    });
  }

  // Validate optional fields
  if ('problemLatex' in ex && ex.problemLatex !== null && typeof ex.problemLatex !== 'string') {
    errors.push('Trường "problemLatex" phải là string hoặc null');
  }

  if ('finalAnswer' in ex && ex.finalAnswer !== null && typeof ex.finalAnswer !== 'string') {
    errors.push('Trường "finalAnswer" phải là string hoặc null');
  }

  if ('commonMistakes' in ex && ex.commonMistakes !== null && ex.commonMistakes !== undefined) {
    if (!Array.isArray(ex.commonMistakes)) {
      errors.push('Trường "commonMistakes" phải là một mảng');
    } else {
      (ex.commonMistakes as unknown[]).forEach((mistake, index) => {
        if (!mistake || typeof mistake !== 'object') {
          errors.push(`Lỗi sai thường gặp thứ ${index + 1} phải là một object`);
          return;
        }

        const mistakeObj = mistake as Record<string, unknown>;

        if (!('mistake' in mistakeObj) || typeof mistakeObj.mistake !== 'string' || !mistakeObj.mistake.trim()) {
          errors.push(`Lỗi sai thường gặp thứ ${index + 1}: "mistake" là bắt buộc và không được để trống`);
        }

        if ('explanation' in mistakeObj && mistakeObj.explanation !== null && typeof mistakeObj.explanation !== 'string') {
          errors.push(`Lỗi sai thường gặp thứ ${index + 1}: "explanation" phải là string hoặc null`);
        }
      });
    }
  }

  if ('hints' in ex && ex.hints !== null && ex.hints !== undefined) {
    if (!Array.isArray(ex.hints)) {
      errors.push('Trường "hints" phải là một mảng');
    } else {
      (ex.hints as unknown[]).forEach((hint, index) => {
        if (typeof hint !== 'string') {
          errors.push(`Gợi ý thứ ${index + 1} phải là string`);
        }
      });
    }
  }

  if ('learningObjective' in ex && ex.learningObjective !== null && typeof ex.learningObjective !== 'string') {
    errors.push('Trường "learningObjective" phải là string hoặc null');
  }

  if ('difficultyLevel' in ex && ex.difficultyLevel !== null && ex.difficultyLevel !== undefined) {
    if (typeof ex.difficultyLevel !== 'number' || ex.difficultyLevel < 1 || ex.difficultyLevel > 5) {
      errors.push('Trường "difficultyLevel" phải là số từ 1 đến 5');
    }
  }

  if ('timeEstimateSec' in ex && ex.timeEstimateSec !== null && ex.timeEstimateSec !== undefined) {
    if (typeof ex.timeEstimateSec !== 'number' || ex.timeEstimateSec <= 0) {
      errors.push('Trường "timeEstimateSec" phải là số dương');
    }
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  // Step 5: Map AI response format → CreateExerciseRequest format
  const aiExercise = ex as AIExerciseResponse;

  const createRequest: CreateExerciseRequest = {
    // Note: skillId and grade need to be set by the user in the form
    skillId: '', // Will be set in the form
    grade: 6, // Will be set in the form
    problemText: aiExercise.problemText,
    problemLatex: aiExercise.problemLatex || undefined,
    finalAnswer: aiExercise.finalAnswer || undefined,
    learningObjective: aiExercise.learningObjective || undefined,
    difficultyLevel: aiExercise.difficultyLevel || undefined,
    timeEstimateSec: aiExercise.timeEstimateSec || undefined,
    solutionSteps: aiExercise.solutionSteps.map((step) => ({
      stepNumber: step.stepNumber,
      description: step.description || undefined,
      content: step.content,
      explanation: step.explanation || undefined,
    })) as SolutionStepRequest[],
    commonMistakes:
      aiExercise.commonMistakes && aiExercise.commonMistakes.length > 0
        ? aiExercise.commonMistakes.map((mistake) => ({
            mistake: mistake.mistake,
            explanation: mistake.explanation || undefined,
          })) as CommonMistakeRequest[]
        : undefined,
    hints: aiExercise.hints && aiExercise.hints.length > 0 ? aiExercise.hints : undefined,
  };

  return {
    valid: true,
    exercise: createRequest,
    errors: [],
  };
}

