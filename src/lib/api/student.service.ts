/**
 * Student Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Student,
  StudentSearchParams,
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

  queryParams.append('role', 'STUDENT');
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('size', params.pageSize.toString());

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


