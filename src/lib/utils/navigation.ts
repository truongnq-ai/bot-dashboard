/**
 * Navigation and Storage Utilities
 * Helper functions for passing data between pages
 */

import { CreateExerciseRequest } from '@/types/exercise';

const STORAGE_KEY_EXERCISE_FROM_JSON = 'exercise_data_from_json';
const STORAGE_KEY_PROMPT_CONTEXT = 'prompt_context_skill_grade';

export interface PromptContext {
  skillId: string;
  grade: number;
  difficultyLevel?: number;
}

/**
 * Save exercise data from JSON to sessionStorage
 */
export function setExerciseDataFromJson(data: CreateExerciseRequest): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_EXERCISE_FROM_JSON, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save exercise data to sessionStorage:', error);
  }
}

/**
 * Get exercise data from JSON from sessionStorage and clear it
 */
export function getExerciseDataFromJson(): CreateExerciseRequest | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY_EXERCISE_FROM_JSON);
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data) as CreateExerciseRequest;
    sessionStorage.removeItem(STORAGE_KEY_EXERCISE_FROM_JSON);
    return parsed;
  } catch (error) {
    console.error('Failed to get exercise data from sessionStorage:', error);
    sessionStorage.removeItem(STORAGE_KEY_EXERCISE_FROM_JSON);
    return null;
  }
}

/**
 * Save prompt context (skillId, grade, difficultyLevel) to sessionStorage
 * Used when user copies prompt from "Tạo với AI" modal
 */
export function setPromptContext(context: PromptContext): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_PROMPT_CONTEXT, JSON.stringify(context));
  } catch (error) {
    console.error('Failed to save prompt context to sessionStorage:', error);
  }
}

/**
 * Get prompt context from sessionStorage (does not clear it)
 */
export function getPromptContext(): PromptContext | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY_PROMPT_CONTEXT);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as PromptContext;
  } catch (error) {
    console.error('Failed to get prompt context from sessionStorage:', error);
    return null;
  }
}

/**
 * Clear prompt context from sessionStorage
 */
export function clearPromptContext(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_PROMPT_CONTEXT);
  } catch (error) {
    console.error('Failed to clear prompt context from sessionStorage:', error);
  }
}

