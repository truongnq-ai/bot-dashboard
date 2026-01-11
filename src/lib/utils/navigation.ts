/**
 * Navigation and Storage Utilities
 * Helper functions for passing data between pages
 */

import { CreateExerciseRequest, Exercise } from '@/types/exercise';

const STORAGE_KEY_EXERCISE_FROM_JSON = 'exercise_data_from_json';
const STORAGE_KEY_EXERCISE_FOR_COPY = 'exercise_data_for_copy';

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
 * Save exercise data for copy operation to sessionStorage
 * Removes id and other fields that should not be copied
 */
export function setExerciseDataForCopy(data: Partial<Exercise>): void {
    try {
        sessionStorage.setItem(STORAGE_KEY_EXERCISE_FOR_COPY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save exercise data for copy to sessionStorage:', error);
    }
}

/**
 * Get exercise data for copy from sessionStorage and clear it
 */
export function getExerciseDataForCopy(): Partial<Exercise> | null {
    try {
        const data = sessionStorage.getItem(STORAGE_KEY_EXERCISE_FOR_COPY);
        if (!data) {
            return null;
        }

        const parsed = JSON.parse(data) as Partial<Exercise>;
        sessionStorage.removeItem(STORAGE_KEY_EXERCISE_FOR_COPY);
        return parsed;
    } catch (error) {
        console.error('Failed to get exercise data for copy from sessionStorage:', error);
        sessionStorage.removeItem(STORAGE_KEY_EXERCISE_FOR_COPY);
        return null;
    }
}
