/**
 * Skill Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { Skill, SkillSearchParams, SkillListResponseData, SkillResponse, CreateSkillRequest } from '../../types/skill';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get skills list with filters and pagination
 */
export async function getSkills(
  params: SkillSearchParams = {}
): Promise<ResponseObject<PageResponse<Skill>>> {
  const queryParams = new URLSearchParams();

  if (params.searchText) queryParams.append('searchText', params.searchText);
  if (params.grade) queryParams.append('grade', params.grade.toString());
  if (params.chapter) queryParams.append('chapter', params.chapter);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

  const response = await apiClient.get<SkillListResponseData>(
    `${API_ENDPOINTS.SKILLS_LIST}?${queryParams.toString()}`
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get skill by ID
 */
export async function getSkillById(id: string): Promise<ResponseObject<Skill>> {
  const response = await apiClient.get<SkillResponse>(API_ENDPOINTS.SKILLS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new skill
 */
export async function createSkill(data: CreateSkillRequest): Promise<ResponseObject<Skill>> {
  const response = await apiClient.post<SkillResponse>(API_ENDPOINTS.SKILLS_CREATE, data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}
