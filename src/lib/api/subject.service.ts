/**
 * Subject API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SubjectListResponse,
  SubjectResponse,
} from '@/types/subject';
import { ResponseObject } from '@/types/common';

/**
 * Get all subjects (no pagination)
 */
export async function getAllSubjects(): Promise<ResponseObject<Subject[]>> {
  const response = await apiClient.get<SubjectListResponse>(API_ENDPOINTS.SUBJECTS_LIST);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get subject by ID
 */
export async function getSubjectById(id: string): Promise<ResponseObject<Subject>> {
  const response = await apiClient.get<SubjectResponse>(API_ENDPOINTS.SUBJECTS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new subject
 */
export async function createSubject(data: CreateSubjectRequest): Promise<ResponseObject<Subject>> {
  const response = await apiClient.post<SubjectResponse>(API_ENDPOINTS.SUBJECTS_CREATE, data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update subject
 */
export async function updateSubject(
  id: string,
  data: UpdateSubjectRequest
): Promise<ResponseObject<Subject>> {
  const response = await apiClient.put<SubjectResponse>(API_ENDPOINTS.SUBJECTS_UPDATE(id), data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Delete subject
 */
export async function deleteSubject(id: string): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(API_ENDPOINTS.SUBJECTS_DELETE(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

