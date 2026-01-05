/**
 * Teacher Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Teacher,
  TeacherSearchParams,
  CreateUserRequest,
  TeacherListResponse,
  TeacherResponse,
} from '../../types/teacher';
import {
  ResponseObject,
  PageResponse,
  ResetPasswordResponse,
  PageRequest,
  UserPageRequest,
} from '../../types/common';

/**
 * Get teachers list with filters and pagination using POST getPage pattern
 */
export async function getTeachers(
  params: TeacherSearchParams = {}
): Promise<ResponseObject<PageResponse<Teacher>>> {
  // Build UserPageRequest filter - role is always TEACHER
  const userPageRequest: UserPageRequest = {
    role: 'TEACHER',
    username: params.username,
    name: params.name,
  };

  // Build PageRequest
  const pageRequest: PageRequest = {
    page: params.page ?? 0,
    pageSize: params.pageSize ?? 10,
    dataRequest: userPageRequest,
  };

  const response = await apiClient.post<TeacherListResponse>(
    API_ENDPOINTS.TEACHERS_GET_PAGE,
    pageRequest
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get teacher by ID
 */
export async function getTeacherById(id: string): Promise<ResponseObject<Teacher>> {
  const response = await apiClient.get<TeacherResponse>(API_ENDPOINTS.TEACHERS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new teacher
 */
export async function createTeacher(
  data: CreateUserRequest
): Promise<ResponseObject<Teacher>> {
  const response = await apiClient.post<TeacherResponse>(API_ENDPOINTS.TEACHERS_CREATE, data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Reset teacher password
 */
export async function resetTeacherPassword(
  id: string
): Promise<ResponseObject<ResetPasswordResponse>> {
  const response = await apiClient.post<ResponseObject<ResetPasswordResponse>>(
    API_ENDPOINTS.USERS_RESET_PASSWORD(id)
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

