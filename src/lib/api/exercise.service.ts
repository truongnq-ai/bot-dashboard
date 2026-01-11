/**
 * Exercise Service - Admin Dashboard
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
    Exercise,
    ExerciseListItem,
    ExerciseListItemWithContent,
    CreateExerciseRequest,
    UpdateExerciseRequest,
    ApproveExerciseRequest,
    AIGenerateExerciseRequest,
    GeneratePromptRequest,
    GeneratePromptResponse,
    ExercisePageRequest,
    GetExercisesBatchRequest,
    ExerciseListResponseData,
    ExerciseResponse,
    UploadFromFileRequest,
    UploadFromFileResponse,
} from '../../types/exercise';
import { ResponseObject, PageRequest, PageResponse } from '../../types/common';

/**
 * Get exercises list with filters and pagination
 */
export async function getExercises(
    pageRequest: PageRequest & { dataRequest?: ExercisePageRequest }
): Promise<ResponseObject<PageResponse<ExerciseListItem>>> {
    const response = await apiClient.post<ExerciseListResponseData>(
        API_ENDPOINTS.EXERCISES_GET_PAGE,
        pageRequest
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
 * Get exercises list WITH content (for selection modal)
 * Use this when content preview is needed
 */
export async function getExercisesWithContent(
    pageRequest: PageRequest & { dataRequest?: ExercisePageRequest }
): Promise<ResponseObject<PageResponse<ExerciseListItemWithContent>>> {
    const response = await apiClient.post<ResponseObject<PageResponse<ExerciseListItemWithContent>>>(
        API_ENDPOINTS.EXERCISES_GET_PAGE_WITH_CONTENT,
        pageRequest
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
 * Get exercises batch by IDs WITH content
 * Use this when you need to fetch multiple exercises with content (e.g., displaying selected exercises)
 */
export async function getExercisesBatch(
    exerciseIds: string[]
): Promise<ResponseObject<ExerciseListItemWithContent[]>> {
    const response = await apiClient.post<ResponseObject<ExerciseListItemWithContent[]>>(
        API_ENDPOINTS.EXERCISES_GET_BATCH,
        { exerciseIds }
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
 * Get exercise by ID (with content field)
 */
export async function getExerciseById(id: string): Promise<ResponseObject<Exercise>> {
    const response = await apiClient.get<ExerciseResponse>(API_ENDPOINTS.EXERCISES_GET(id));

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch exercise');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Create new exercise
 */
export async function createExercise(
    data: CreateExerciseRequest
): Promise<ResponseObject<Exercise>> {
    const response = await apiClient.post<ExerciseResponse>(
        API_ENDPOINTS.EXERCISES_CREATE,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to create exercise');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Update exercise
 */
export async function updateExercise(
    id: string,
    data: UpdateExerciseRequest
): Promise<ResponseObject<Exercise>> {
    const response = await apiClient.put<ExerciseResponse>(
        API_ENDPOINTS.EXERCISES_UPDATE(id),
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to update exercise');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Approve exercise (change status from DRAFT to APPROVED)
 */
export async function approveExercise(
    id: string,
    data?: ApproveExerciseRequest
): Promise<ResponseObject<Exercise>> {
    const response = await apiClient.post<ExerciseResponse>(
        API_ENDPOINTS.EXERCISES_APPROVE(id),
        data || {}
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to approve exercise');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Delete exercise
 */
export async function deleteExercise(id: string): Promise<ResponseObject<void>> {
    const response = await apiClient.delete<ResponseObject<void>>(
        API_ENDPOINTS.EXERCISES_DELETE(id)
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to delete exercise');
    }

    return response.data;
}

/**
 * Generate exercise with AI
 */
export async function generateExerciseWithAI(
    data: AIGenerateExerciseRequest
): Promise<ResponseObject<Exercise>> {
    const response = await apiClient.post<ExerciseResponse>(
        API_ENDPOINTS.EXERCISES_AI_GENERATE,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to generate exercise with AI');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Generate prompt for exercise creation
 */
export async function generatePrompt(
    data: GeneratePromptRequest
): Promise<ResponseObject<GeneratePromptResponse>> {
    const response = await apiClient.post<ResponseObject<GeneratePromptResponse>>(
        API_ENDPOINTS.PROMPTS_GENERATE,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to generate prompt');
    }

    return response.data;
}

/**
 * Upload file and extract exercises (Legacy)
 */
export async function uploadFileForExercise(
    data: UploadFromFileRequest
): Promise<ResponseObject<UploadFromFileResponse>> {
    const response = await apiClient.post<ResponseObject<UploadFromFileResponse>>(
        API_ENDPOINTS.EXERCISES_UPLOAD_FROM_FILE,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to upload file and extract exercises');
    }

    return response.data;
}

/**
 * Upload Image and extract exercises
 */
export async function uploadImageForExercise(
    data: UploadFromFileRequest
): Promise<ResponseObject<UploadFromFileResponse>> {
    const response = await apiClient.post<ResponseObject<UploadFromFileResponse>>(
        API_ENDPOINTS.EXERCISES_UPLOAD_IMAGE,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to upload image and extract exercises');
    }

    return response.data;
}

/**
 * Upload PDF and extract exercises
 */
export async function uploadPdfForExercise(
    data: UploadFromFileRequest
): Promise<ResponseObject<UploadFromFileResponse>> {
    const response = await apiClient.post<ResponseObject<UploadFromFileResponse>>(
        API_ENDPOINTS.EXERCISES_UPLOAD_PDF,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to upload PDF and extract exercises');
    }

    return response.data;
}

/**
 * Upload DOCX and extract exercises
 */
export async function uploadDocxForExercise(
    data: UploadFromFileRequest
): Promise<ResponseObject<UploadFromFileResponse>> {
    const response = await apiClient.post<ResponseObject<UploadFromFileResponse>>(
        API_ENDPOINTS.EXERCISES_UPLOAD_DOCX,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to upload DOCX and extract exercises');
    }

    return response.data;
}
