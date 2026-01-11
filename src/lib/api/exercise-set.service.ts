/**
 * Exercise Set Service - Admin Dashboard
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
    ExerciseSet,
    ExerciseSetItem,
    ExerciseSetListItem,
    CreateExerciseSetRequest,
    UpdateExerciseSetRequest,
    DuplicateExerciseSetRequest,
    ExerciseSetPageRequest,
    ExerciseSetListResponseData,
    ExerciseSetResponse,
} from '../../types/exercise-set';
import { ResponseObject, PageRequest, PageResponse } from '../../types/common';

/**
 * Get exercise sets list with filters and pagination
 */
export async function getExerciseSets(
    pageRequest: PageRequest & { dataRequest?: ExerciseSetPageRequest }
): Promise<ResponseObject<PageResponse<ExerciseSetListItem>>> {
    const response = await apiClient.post<ExerciseSetListResponseData>(
        API_ENDPOINTS.EXERCISE_SETS_GET_PAGE,
        pageRequest
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch exercise sets');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Get exercise set by ID (with full exercise list)
 */
export async function getExerciseSetById(id: string): Promise<ResponseObject<ExerciseSet>> {
    const response = await apiClient.get<ExerciseSetResponse>(API_ENDPOINTS.EXERCISE_SETS_GET(id));

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch exercise set');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Get exercises of exercise set (with full details)
 * Use this to fetch exercises with content, topic, difficulty for display
 */
export async function getExerciseSetExercises(
    exerciseSetId: string
): Promise<ResponseObject<ExerciseSetItem[]>> {
    const response = await apiClient.get<ResponseObject<ExerciseSetItem[]>>(
        API_ENDPOINTS.EXERCISE_SETS_GET_EXERCISES(exerciseSetId)
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch exercises');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Create new exercise set
 */
export async function createExerciseSet(
    data: CreateExerciseSetRequest
): Promise<ResponseObject<ExerciseSet>> {
    const response = await apiClient.post<ExerciseSetResponse>(
        API_ENDPOINTS.EXERCISE_SETS_CREATE,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to create exercise set');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Update exercise set
 */
export async function updateExerciseSet(
    id: string,
    data: UpdateExerciseSetRequest
): Promise<ResponseObject<ExerciseSet>> {
    const response = await apiClient.put<ExerciseSetResponse>(
        API_ENDPOINTS.EXERCISE_SETS_UPDATE(id),
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to update exercise set');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Delete exercise set
 */
export async function deleteExerciseSet(id: string): Promise<ResponseObject<void>> {
    const response = await apiClient.delete<ResponseObject<void>>(
        API_ENDPOINTS.EXERCISE_SETS_DELETE(id)
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to delete exercise set');
    }

    return response.data;
}

/**
 * Duplicate exercise set
 */
export async function duplicateExerciseSet(
    id: string,
    data?: DuplicateExerciseSetRequest
): Promise<ResponseObject<ExerciseSet>> {
    const response = await apiClient.post<ExerciseSetResponse>(
        API_ENDPOINTS.EXERCISE_SETS_DUPLICATE(id),
        data || {}
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to duplicate exercise set');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}
