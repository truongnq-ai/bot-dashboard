/**
 * Class API Service (Admin Dashboard)
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
    Class,
    CreateClassRequest,
    UpdateClassRequest,
    ClassListResponse,
    ClassResponse,
} from '@/types/class';
import { ResponseObject } from '@/types/common';

/**
 * Get all classes (no pagination)
 * @param subjectId Optional subject ID filter
 * @param name Optional name filter (case-insensitive search)
 */
export async function getClasses(
    subjectId?: string,
    name?: string
): Promise<ResponseObject<Class[]>> {
    const params = new URLSearchParams();
    if (subjectId) {
        params.append('subjectId', subjectId);
    }
    if (name && name.trim() !== '') {
        params.append('name', name.trim());
    }

    const url = params.toString()
        ? `${API_ENDPOINTS.CLASSES_LIST}?${params.toString()}`
        : API_ENDPOINTS.CLASSES_LIST;

    const response = await apiClient.get<ClassListResponse>(url);

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Get class by ID
 */
export async function getClassById(id: string): Promise<ResponseObject<Class>> {
    const response = await apiClient.get<ClassResponse>(API_ENDPOINTS.CLASSES_GET(id));

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Create new class
 */
export async function createClass(data: CreateClassRequest): Promise<ResponseObject<Class>> {
    const response = await apiClient.post<ClassResponse>(API_ENDPOINTS.CLASSES_CREATE, data);

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Update class
 */
export async function updateClass(
    id: string,
    data: UpdateClassRequest
): Promise<ResponseObject<Class>> {
    const response = await apiClient.put<ClassResponse>(API_ENDPOINTS.CLASSES_UPDATE(id), data);

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Delete class
 */
export async function deleteClass(id: string): Promise<ResponseObject<void>> {
    const response = await apiClient.delete<ResponseObject<void>>(API_ENDPOINTS.CLASSES_DELETE(id));

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}
