/**
 * API Endpoints Constants
 */

export const API_ENDPOINTS = {
  // Authentication
  ADMIN_LOGIN: '/api/v1/admin/login',
  AUTH_REFRESH_TOKEN: '/api/v1/auth/refresh_token',
  AUTH_LOGOUT: '/api/v1/auth/logout',

  // Exercises
  EXERCISES_LIST: '/api/v1/admin/exercises',
  EXERCISES_CREATE: '/api/v1/admin/exercises',
  EXERCISES_GET: (id: string) => `/api/v1/admin/exercises/${id}`,
  EXERCISES_UPDATE: (id: string) => `/api/v1/admin/exercises/${id}`,
  EXERCISES_DELETE: (id: string) => `/api/v1/admin/exercises/${id}`,
  EXERCISES_BY_SKILL: (skillId: string) => `/api/v1/admin/exercises/by-skill/${skillId}`,
  EXERCISES_STATS: (id: string) => `/api/v1/admin/exercises/${id}/stats`,
  EXERCISES_REVIEW: (id: string) => `/api/v1/admin/exercises/${id}/review`,
  EXERCISES_REVIEW_HISTORY: (id: string) => `/api/v1/admin/exercises/${id}/review-history`,

  // Skills
  SKILLS_LIST: '/api/v1/admin/skills',

  // Images
  IMAGES_UPLOAD: '/api/v1/images/upload',
  IMAGES_DELETE: (publicId: string) => `/api/v1/images/${publicId}`,
} as const;
