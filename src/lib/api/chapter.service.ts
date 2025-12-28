/**
 * Chapter API Service
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Chapter,
  ChapterSearchParams,
  CreateChapterRequest,
  UpdateChapterRequest,
  ChapterListResponse,
  ChapterResponse,
} from '@/types/chapter';
import { ResponseObject, PageResponse } from '@/types/common';

/**
 * Get chapters list with pagination and filters
 */
export async function getChapters(
  params: ChapterSearchParams = {}
): Promise<ResponseObject<PageResponse<Chapter>>> {
  const queryParams = new URLSearchParams();
  
  if (params.grade !== undefined) {
    queryParams.append('grade', params.grade.toString());
  }
  if (params.name) {
    queryParams.append('name', params.name);
  }
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  if (params.pageSize !== undefined) {
    queryParams.append('pageSize', params.pageSize.toString());
  }
  if (params.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params.sortDirection) {
    queryParams.append('sortDirection', params.sortDirection);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${API_ENDPOINTS.CHAPTERS_LIST}?${queryString}` : API_ENDPOINTS.CHAPTERS_LIST;
  
  const response = await apiClient.get<ChapterListResponse>(url);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get chapter by ID
 */
export async function getChapterById(id: string): Promise<ResponseObject<Chapter>> {
  const response = await apiClient.get<ChapterResponse>(API_ENDPOINTS.CHAPTERS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new chapter
 */
export async function createChapter(data: CreateChapterRequest): Promise<ResponseObject<Chapter>> {
  const response = await apiClient.post<ChapterResponse>(API_ENDPOINTS.CHAPTERS_CREATE, data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update chapter
 */
export async function updateChapter(
  id: string,
  data: UpdateChapterRequest
): Promise<ResponseObject<Chapter>> {
  const response = await apiClient.put<ChapterResponse>(API_ENDPOINTS.CHAPTERS_UPDATE(id), data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Delete chapter
 */
export async function deleteChapter(id: string): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(API_ENDPOINTS.CHAPTERS_DELETE(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get chapters by grade (for dropdown)
 */
export async function getChaptersByGrade(grade: 6 | 7): Promise<ResponseObject<Chapter[]>> {
  const response = await apiClient.get<ResponseObject<Chapter[]>>(API_ENDPOINTS.CHAPTERS_BY_GRADE(grade));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

