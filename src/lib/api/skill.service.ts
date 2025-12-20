/**
 * Skill Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { Skill, SkillListResponseData } from '../../types/skill';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get skills list
 */
export async function getSkills(): Promise<ResponseObject<PageResponse<Skill>>> {
  const response = await apiClient.get<SkillListResponseData>(API_ENDPOINTS.SKILLS_LIST);
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch skills');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}
