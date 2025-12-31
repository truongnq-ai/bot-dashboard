/**
 * Skill Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { Skill, SkillSearchParams, SkillListResponseData, SkillResponse, CreateSkillRequest, UpdateSkillRequest, SkillPrerequisiteDetail, AddSkillPrerequisiteRequest } from '../../types/skill';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get skills list with filters and pagination
 * Note: Backend currently returns List<SkillResponse>, so we convert it to PageResponse on client-side
 */
export async function getSkills(
  params: SkillSearchParams = {}
): Promise<ResponseObject<PageResponse<Skill>>> {
  const queryParams = new URLSearchParams();

  if (params.grade) queryParams.append('grade', params.grade.toString());
  if (params.chapterId) queryParams.append('chapterId', params.chapterId);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

  const response = await apiClient.get<ResponseObject<Skill[]>>(
    `${API_ENDPOINTS.SKILLS_LIST}?${queryParams.toString()}`
  );

  // Backend returns List<SkillResponse>, convert to PageResponse
  if (response.data.errorCode === '0000' && response.data.data) {
    const skillsList = response.data.data as unknown as Skill[];
    const page = params.page || 0;
    const pageSize = params.pageSize || 10;
    
    // Apply client-side filtering if needed (since backend doesn't support it yet)
    // Note: Filter only if the field exists in the response
    let filteredSkills = skillsList;
    if (params.grade) {
      filteredSkills = filteredSkills.filter(s => s.grade === params.grade);
    }
    if (params.chapterId) {
      filteredSkills = filteredSkills.filter(s => s.chapterId === params.chapterId);
    }
    
    // Apply pagination
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSkills = filteredSkills.slice(startIndex, endIndex);
    const totalElements = filteredSkills.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    
    const pageResponse: PageResponse<Skill> = {
      content: paginatedSkills,
      totalElements,
      totalPages,
      page,
      pageSize,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    };
    
    return {
      errorCode: response.data.errorCode,
      errorDetail: response.data.errorDetail,
      data: pageResponse,
    };
  }
  
  // Return empty page response if no data
  const page = params.page || 0;
  const pageSize = params.pageSize || 10;
  const emptyPageResponse: PageResponse<Skill> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    page,
    pageSize,
    hasNext: false,
    hasPrevious: false,
  };

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: emptyPageResponse,
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
 * Get skills by chapter ID
 */
export async function getSkillsByChapter(chapterId: string): Promise<ResponseObject<Skill[]>> {
  const response = await apiClient.get<ResponseObject<Skill[]>>(
    API_ENDPOINTS.SKILLS_GET_BY_CHAPTER(chapterId)
  );

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

/**
 * Update skill
 */
export async function updateSkill(id: string, data: UpdateSkillRequest): Promise<ResponseObject<Skill>> {
  const response = await apiClient.put<SkillResponse>(API_ENDPOINTS.SKILLS_UPDATE(id), data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get skill prerequisites
 */
export async function getSkillPrerequisites(skillId: string): Promise<ResponseObject<SkillPrerequisiteDetail[]>> {
  const response = await apiClient.get<ResponseObject<SkillPrerequisiteDetail[]>>(
    API_ENDPOINTS.SKILLS_GET_PREREQUISITES(skillId)
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get available prerequisites for skill
 */
export async function getAvailablePrerequisitesForSkill(skillId: string): Promise<ResponseObject<Skill[]>> {
  const response = await apiClient.get<ResponseObject<Skill[]>>(
    API_ENDPOINTS.SKILLS_GET_AVAILABLE_PREREQUISITES(skillId)
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Add prerequisite to skill
 */
export async function addSkillPrerequisite(
  skillId: string,
  data: AddSkillPrerequisiteRequest
): Promise<ResponseObject<void>> {
  const response = await apiClient.post<ResponseObject<void>>(
    API_ENDPOINTS.SKILLS_ADD_PREREQUISITE(skillId),
    data
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Remove prerequisite from skill
 */
export async function removeSkillPrerequisite(
  skillId: string,
  prerequisiteSkillId: string
): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(
    API_ENDPOINTS.SKILLS_REMOVE_PREREQUISITE(skillId, prerequisiteSkillId)
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}
