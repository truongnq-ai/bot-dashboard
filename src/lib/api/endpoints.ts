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

  // Exercises
  EXERCISES_GET_PAGE: `${API_VERSION}/exercises/getPage/`,
  EXERCISES_GET_PAGE_WITH_CONTENT: `${API_VERSION}/exercises/getPageWithContent/`,
  EXERCISES_GET_BATCH: `${API_VERSION}/exercises/getBatch/`,
  EXERCISES_CREATE: `${API_VERSION}/exercises`,
  EXERCISES_GET: (id: string) => `${API_VERSION}/exercises/${id}`,
  EXERCISES_UPDATE: (id: string) => `${API_VERSION}/exercises/${id}`,
  EXERCISES_APPROVE: (id: string) => `${API_VERSION}/exercises/${id}/approve`,
  EXERCISES_DELETE: (id: string) => `${API_VERSION}/exercises/${id}`,
  EXERCISES_AI_GENERATE: `${API_VERSION}/exercises/ai-generate`,
  EXERCISES_UPLOAD_FROM_FILE: `${API_VERSION}/exercises/upload-from-file`,
  EXERCISES_UPLOAD_IMAGE: `${API_VERSION}/exercises/upload/image`,
  EXERCISES_UPLOAD_PDF: `${API_VERSION}/exercises/upload/pdf`,
  EXERCISES_UPLOAD_DOCX: `${API_VERSION}/exercises/upload/docx`,
  EXERCISES_STATS: `${API_VERSION}/exercises/stats`,

  // Prompts
  PROMPTS_GENERATE: `${API_VERSION}/prompts/generate`,

  // Exercise Sets
  EXERCISE_SETS_GET_PAGE: `${API_VERSION}/exercise-sets/getPage/`,
  EXERCISE_SETS_CREATE: `${API_VERSION}/exercise-sets`,
  EXERCISE_SETS_GET: (id: string) => `${API_VERSION}/exercise-sets/${id}`,
  EXERCISE_SETS_GET_EXERCISES: (id: string) => `${API_VERSION}/exercise-sets/${id}/exercises`,
  EXERCISE_SETS_UPDATE: (id: string) => `${API_VERSION}/exercise-sets/${id}`,
  EXERCISE_SETS_DELETE: (id: string) => `${API_VERSION}/exercise-sets/${id}`,
  EXERCISE_SETS_DUPLICATE: (id: string) => `${API_VERSION}/exercise-sets/${id}/duplicate`,

  // Assignments
  ASSIGNMENTS_CREATE: `${API_VERSION}/teaching/assignments`,
  ASSIGNMENTS_CREATE_BATCH: `${API_VERSION}/teaching/assignments/batch`,
  ASSIGNMENTS_GET_PAGE: `${API_VERSION}/teaching/assignments/getPage/`,
  ASSIGNMENTS_GET: (id: string) => `${API_VERSION}/teaching/assignments/${id}`,
  ASSIGNMENTS_DELETE: (id: string) => `${API_VERSION}/teaching/assignments/${id}`,
  ASSIGNMENTS_BY_CLASS: (classId: string) => `${API_VERSION}/teaching/assignments/classes/${classId}`,
  ASSIGNMENTS_BY_EXERCISE_SET: (exerciseSetId: string) => `${API_VERSION}/teaching/assignments/exercise-sets/${exerciseSetId}`,

  // Results
  RESULTS_CREATE: `${API_VERSION}/teaching/results`,
  RESULTS_CREATE_BATCH: `${API_VERSION}/teaching/results/batch`,
  RESULTS_UPDATE: (id: string) => `${API_VERSION}/teaching/results/${id}`,
  RESULTS_GET: (id: string) => `${API_VERSION}/teaching/results/${id}`,
  RESULTS_BY_ASSIGNMENT: (assignmentId: string) => `${API_VERSION}/teaching/results/assignments/${assignmentId}`,

  // Comments
  COMMENTS_CREATE: `${API_VERSION}/teaching/comments`,
  COMMENTS_UPDATE: (id: string) => `${API_VERSION}/teaching/comments/${id}`,
  COMMENTS_GET: (id: string) => `${API_VERSION}/teaching/comments/${id}`,
  COMMENTS_BY_ASSIGNMENT: (assignmentId: string) => `${API_VERSION}/teaching/comments/assignments/${assignmentId}`,
  COMMENTS_AI_DRAFT: `${API_VERSION}/teaching/comments/ai-draft`,

  CLASSES_LIST: `${API_VERSION}/teaching/classes`,
  CLASSES_GET: (id: string) => `${API_VERSION}/teaching/classes/${id}`,
  CLASSES_CREATE: `${API_VERSION}/teaching/classes`,
  CLASSES_UPDATE: (id: string) => `${API_VERSION}/teaching/classes/${id}`,
  CLASSES_DELETE: (id: string) => `${API_VERSION}/teaching/classes/${id}`,

} as const;
