/**
 * Chapter API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Chapter,
  ChapterSearchParams,
  CreateChapterRequest,
  UpdateChapterRequest,
  ChapterListResponse,
  ChapterResponse,
  ChapterSkillDetail,
  ChapterSkillsResponse,
  AddChapterSkillRequest,
} from '@/types/chapter';
import { Skill } from '@/types/skill';
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
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  if (params.pageSize) {
    queryParams.append('size', params.pageSize.toString());
  }

  const response = await apiClient.get<ChapterListResponse>(
    `${API_ENDPOINTS.CHAPTERS_LIST}?${queryParams.toString()}`
  );

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

/**
 * Get skills for a chapter
 */
export async function getChapterSkills(chapterId: string): Promise<ResponseObject<ChapterSkillDetail[]>> {
  const response = await apiClient.get<ChapterSkillsResponse>(API_ENDPOINTS.CHAPTERS_GET_SKILLS(chapterId));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Add skill to chapter
 */
export async function addSkillToChapter(
  chapterId: string,
  data: AddChapterSkillRequest
): Promise<ResponseObject<void>> {
  const response = await apiClient.post<ResponseObject<void>>(
    API_ENDPOINTS.CHAPTERS_ADD_SKILL(chapterId),
    data
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Remove skill from chapter
 */
export async function removeSkillFromChapter(
  chapterId: string,
  skillId: string
): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(
    API_ENDPOINTS.CHAPTERS_REMOVE_SKILL(chapterId, skillId)
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get available skills for chapter (skills not yet in chapter)
 */
export async function getAvailableSkillsForChapter(
  chapterId: string
): Promise<ResponseObject<Skill[]>> {
  const response = await apiClient.get<ResponseObject<Skill[]>>(
    API_ENDPOINTS.CHAPTERS_GET_AVAILABLE_SKILLS(chapterId)
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

