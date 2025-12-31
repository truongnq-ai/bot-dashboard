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

  // Exercises
  EXERCISES_LIST: `${API_VERSION}/admin/exercises`,
  EXERCISES_CREATE: `${API_VERSION}/admin/exercises`,
  EXERCISES_GET: (id: string) => `${API_VERSION}/admin/exercises/${id}`,
  EXERCISES_UPDATE: (id: string) => `${API_VERSION}/admin/exercises/${id}`,
  EXERCISES_DELETE: (id: string) => `${API_VERSION}/admin/exercises/${id}`,
  EXERCISES_BY_SKILL: (skillId: string) => `${API_VERSION}/admin/exercises/by-skill/${skillId}`,
  EXERCISES_STATS: (id: string) => `${API_VERSION}/admin/exercises/${id}/stats`,
  EXERCISES_REVIEW: (id: string) => `${API_VERSION}/admin/exercises/${id}/review`,
  EXERCISES_REVIEW_HISTORY: (id: string) => `${API_VERSION}/admin/exercises/${id}/review-history`,
  EXERCISES_GENERATE: `${API_VERSION}/admin/exercises/generate`,
  EXERCISES_GENERATE_PROMPT: `${API_VERSION}/admin/exercises/generate-prompt`,
  EXERCISES_VALIDATE_LATEX: (id: string) => `${API_VERSION}/admin/exercises/${id}/validate-latex`,

  // Chapters
  CHAPTERS_LIST: `${API_VERSION}/admin/chapters`,
  CHAPTERS_CREATE: `${API_VERSION}/admin/chapters`,
  CHAPTERS_GET: (id: string) => `${API_VERSION}/admin/chapters/${id}`,
  CHAPTERS_UPDATE: (id: string) => `${API_VERSION}/admin/chapters/${id}`,
  CHAPTERS_DELETE: (id: string) => `${API_VERSION}/admin/chapters/${id}`,
  CHAPTERS_BY_GRADE: (grade: number) => `${API_VERSION}/admin/chapters/by-grade/${grade}`,
  CHAPTERS_GET_SKILLS: (chapterId: string) => `${API_VERSION}/admin/chapters/${chapterId}/skills`,
  CHAPTERS_GET_AVAILABLE_SKILLS: (chapterId: string) => `${API_VERSION}/admin/chapters/${chapterId}/available-skills`,
  CHAPTERS_ADD_SKILL: (chapterId: string) => `${API_VERSION}/admin/chapters/${chapterId}/skills`,
  CHAPTERS_REMOVE_SKILL: (chapterId: string, skillId: string) => `${API_VERSION}/admin/chapters/${chapterId}/skills/${skillId}`,

  // Skills
  SKILLS_LIST: `${API_VERSION}/admin/skills`,
  SKILLS_CREATE: `${API_VERSION}/admin/skills`,
  SKILLS_GET: (id: string) => `${API_VERSION}/admin/skills/${id}`,
  SKILLS_UPDATE: (id: string) => `${API_VERSION}/admin/skills/${id}`,
  SKILLS_DELETE: (id: string) => `${API_VERSION}/admin/skills/${id}`,
  SKILLS_GET_PREREQUISITES: (skillId: string) => `${API_VERSION}/admin/skills/${skillId}/prerequisites`,
  SKILLS_GET_AVAILABLE_PREREQUISITES: (skillId: string) => `${API_VERSION}/admin/skills/${skillId}/available-prerequisites`,
  SKILLS_ADD_PREREQUISITE: (skillId: string) => `${API_VERSION}/admin/skills/${skillId}/prerequisites`,
  SKILLS_REMOVE_PREREQUISITE: (skillId: string, prerequisiteSkillId: string) => `${API_VERSION}/admin/skills/${skillId}/prerequisites/${prerequisiteSkillId}`,

  // Admins
  ADMINS_LIST: `${API_VERSION}/admin/users`,
  ADMINS_GET: (id: string) => `${API_VERSION}/admin/users/${id}`,
  ADMINS_CREATE: `${API_VERSION}/admin/users`,
  USERS_RESET_PASSWORD: (id: string) => `${API_VERSION}/admin/users/${id}/reset-password`,

  // Students
  STUDENTS_LIST: `${API_VERSION}/admin/users`,
  STUDENTS_GET: (id: string) => `${API_VERSION}/admin/users/${id}`,

  // Parents
  PARENTS_LIST: `${API_VERSION}/admin/users`,
  PARENTS_GET: (id: string) => `${API_VERSION}/admin/users/${id}`,

  // Devices
  DEVICES_BY_USER: (userId: string) => `${API_VERSION}/admin/devices/user/${userId}`,

  // Grades
  GRADES_LIST: `${API_VERSION}/admin/grades`,

  // Images
  IMAGES_UPLOAD: `${API_VERSION}/images/upload`,
  IMAGES_DELETE: (publicId: string) => `${API_VERSION}/images/${publicId}`,

  // Questions
  QUESTIONS_LIST: `${API_VERSION}/admin/questions`,
  QUESTIONS_GET: (id: string) => `${API_VERSION}/admin/questions/${id}`,
  QUESTIONS_BY_EXERCISE: (exerciseId: string) => `${API_VERSION}/admin/exercises/${exerciseId}/questions`,
  QUESTIONS_BY_SKILL: (skillId: string) => `${API_VERSION}/admin/skills/${skillId}/questions`,
  QUESTIONS_STATS: (id: string) => `${API_VERSION}/admin/questions/${id}/stats`,
  QUESTIONS_PRACTICES: (id: string) => `${API_VERSION}/admin/questions/${id}/practices`,
  QUESTIONS_GENERATE: `${API_VERSION}/admin/questions/generate`,

  // Prompt Templates
  PROMPT_TEMPLATES_LIST: `${API_VERSION}/admin/prompt-templates`,
  PROMPT_TEMPLATES_CREATE: `${API_VERSION}/admin/prompt-templates`,
  PROMPT_TEMPLATES_GET: (id: string) => `${API_VERSION}/admin/prompt-templates/${id}`,
  PROMPT_TEMPLATES_UPDATE: (id: string) => `${API_VERSION}/admin/prompt-templates/${id}`,
  PROMPT_TEMPLATES_DELETE: (id: string) => `${API_VERSION}/admin/prompt-templates/${id}`,
  PROMPT_TEMPLATES_ACTIVATE: (id: string) => `${API_VERSION}/admin/prompt-templates/${id}/activate`,
  PROMPT_TEMPLATES_DEACTIVATE: (id: string) => `${API_VERSION}/admin/prompt-templates/${id}/deactivate`,
  PROMPT_TEMPLATES_ACTIVE: `${API_VERSION}/admin/prompt-templates/active`,
} as const;
