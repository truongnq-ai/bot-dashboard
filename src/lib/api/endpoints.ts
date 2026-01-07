/**
 * API Endpoints Constants
 */

// API Version prefix - centralized for easy maintenance
const API_VERSION = '/api/v1';

export const API_ENDPOINTS = {
  // Authentication
  ADMIN_LOGIN: `${API_VERSION}/admin/login`,
  AUTH_REFRESH_TOKEN: `${API_VERSION}/auth/refresh_token`,
  AUTH_LOGOUT: `${API_VERSION}/auth/logout`,

  // Subjects
  SUBJECTS_LIST: `${API_VERSION}/admin/subjects`,
  SUBJECTS_GET: (id: string) => `${API_VERSION}/admin/subjects/${id}`,
  SUBJECTS_CREATE: `${API_VERSION}/admin/subjects`,
  SUBJECTS_UPDATE: (id: string) => `${API_VERSION}/admin/subjects/${id}`,
  SUBJECTS_DELETE: (id: string) => `${API_VERSION}/admin/subjects/${id}`,

  // Topics
  TOPICS_LIST: `${API_VERSION}/admin/topics`,
  TOPICS_GET: (id: string) => `${API_VERSION}/admin/topics/${id}`,
  TOPICS_CREATE: `${API_VERSION}/admin/topics`,
  TOPICS_UPDATE: (id: string) => `${API_VERSION}/admin/topics/${id}`,
  TOPICS_DELETE: (id: string) => `${API_VERSION}/admin/topics/${id}`,

  // Admins
  ADMINS_LIST: `${API_VERSION}/admin/users`,
  ADMINS_GET_PAGE: `${API_VERSION}/admin/users/getPage/`,
  ADMINS_GET: (id: string) => `${API_VERSION}/admin/users/${id}`,
  ADMINS_CREATE: `${API_VERSION}/admin/users`,
  USERS_RESET_PASSWORD: (id: string) => `${API_VERSION}/admin/users/${id}/reset-password`,

  // Teachers
  TEACHERS_GET_PAGE: `${API_VERSION}/admin/users/getPage/`,
  TEACHERS_GET: (id: string) => `${API_VERSION}/admin/users/${id}`,
  TEACHERS_CREATE: `${API_VERSION}/admin/users`,

} as const;
