/**
 * Student Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Student,
  StudentSearchParams,
  UpdateStudentStatusRequest,
  StudentListResponse,
  StudentResponse,
} from '../../types/student';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get students list with filters and pagination
 */
export async function getStudents(
  params: StudentSearchParams = {}
): Promise<ResponseObject<PageResponse<Student>>> {
  const queryParams = new URLSearchParams();

  if (params.searchText) queryParams.append('searchText', params.searchText);
  if (params.status) queryParams.append('status', params.status);
  if (params.studentStatus) queryParams.append('studentStatus', params.studentStatus);
  if (params.grade !== undefined) queryParams.append('grade', params.grade.toString());
  if (params.parentId) queryParams.append('parentId', params.parentId);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

  const response = await apiClient.get<StudentListResponse>(
    `${API_ENDPOINTS.STUDENTS_LIST}?${queryParams.toString()}`
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get student by ID
 */
export async function getStudentById(id: string): Promise<ResponseObject<Student>> {
  const response = await apiClient.get<StudentResponse>(API_ENDPOINTS.STUDENTS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update student status
 */
export async function updateStudentStatus(
  id: string,
  status: UpdateStudentStatusRequest['status']
): Promise<ResponseObject<Student>> {
  const response = await apiClient.put<StudentResponse>(API_ENDPOINTS.STUDENTS_UPDATE_STATUS(id), {
    status,
  });

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

