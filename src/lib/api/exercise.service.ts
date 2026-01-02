/**
 * Exercise Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Exercise,
  CreateExerciseRequest,
  CreateExerciseSolutionRequest,
  UpdateExerciseRequest,
  ReviewExerciseRequest,
  ExerciseSearchParams,
  ExerciseListResponseData,
  ExerciseResponse,
  ExerciseStatsResponse,
  ExerciseReviewLog,
  ReviewHistoryResponse,
  GenerateExercisesRequest,
  GenerateExercisesResponse,
  GeneratePromptRequest,
  GeneratePromptResponse,
  ImportExerciseJsonRequest,
  ValidateJsonRequest,
  ValidateJsonResponse,
  ValidateLaTeXRequest,
  ValidateLaTeXResponse,
  CheckJsonRequest,
  CheckJsonResponse,
  FixJsonRequest,
  FixJsonResponse,
  CheckLaTeXRequest,
  CheckLaTeXResponse,
  FixLaTeXRequest,
  FixLaTeXResponse,
  ReviewStatus,
  ExerciseSolutionResponse,
  SolutionStep,
} from '../../types/exercise';
import { ResponseObject, PageResponse } from '../../types/common';
import { mapExerciseStatusToReviewStatus } from '../utils/exercise-status-mapper';

/**
 * Get exercises list with filters and pagination
 */
export async function getExercises(
  params: ExerciseSearchParams = {}
): Promise<ResponseObject<PageResponse<Exercise>>> {
  const queryParams = new URLSearchParams();
  
  if (params.skillId) queryParams.append('skillId', params.skillId);
  if (params.grade) queryParams.append('grade', params.grade.toString());
  if (params.chapterId) queryParams.append('chapterId', params.chapterId);
  // Map ReviewStatus to ExerciseStatus for backend
  // Frontend filter can send DRAFT, REVIEWED, or APPROVED as string
  if (params.reviewStatus) {
    const statusStr = params.reviewStatus.toString();
    if (statusStr === 'APPROVED' || statusStr === ReviewStatus.APPROVED) {
      queryParams.append('status', 'APPROVED');
    } else if (statusStr === 'DRAFT') {
      queryParams.append('status', 'DRAFT');
    } else if (statusStr === 'REVIEWED') {
      queryParams.append('status', 'REVIEWED');
    }
  }
  if (params.difficultyLevel) queryParams.append('difficulty', params.difficultyLevel.toString());
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('size', params.pageSize.toString());
  
  const response = await apiClient.get<ExerciseListResponseData>(
    `${API_ENDPOINTS.EXERCISES_LIST}?${queryParams.toString()}`
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercises');
  }
  
  // Map ExerciseStatus from backend to ReviewStatus for frontend
  if (response.data.data?.content) {
    response.data.data.content = response.data.data.content.map((exercise: any) => {
      // Map status from backend ExerciseStatus to frontend ReviewStatus
      return {
        ...exercise,
        reviewStatus: mapExerciseStatusToReviewStatus(exercise.status),
        // Ensure problemText is set (backend returns both contentText and problemText)
        problemText: exercise.problemText || exercise.contentText,
      };
    });
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get exercise solutions by exercise ID
 */
export async function getExerciseSolutions(exerciseId: string): Promise<ResponseObject<ExerciseSolutionResponse[]>> {
  const response = await apiClient.get<ResponseObject<ExerciseSolutionResponse[]>>(
    `${API_ENDPOINTS.EXERCISES_GET(exerciseId)}/solutions`
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercise solutions');
  }
  
  return response.data;
}

/**
 * Get exercise by ID (with solution steps and final answer)
 */
export async function getExerciseById(id: string): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.get<ExerciseResponse>(API_ENDPOINTS.EXERCISES_GET(id));
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercise');
  }
  
  // Fetch solution steps separately
  let solutionSteps: SolutionStep[] = [];
  let finalAnswer: string | undefined = undefined;
  
  try {
    const solutionsResponse = await getExerciseSolutions(id);
    if (solutionsResponse.data && solutionsResponse.data.length > 0) {
      const solution = solutionsResponse.data[0]; // Get first solution
      
      // Parse solutionSteps JSON string
      if (solution.solutionSteps) {
        try {
          solutionSteps = JSON.parse(solution.solutionSteps) as SolutionStep[];
        } catch (e) {
          console.error('Failed to parse solutionSteps:', e);
        }
      }
      
      finalAnswer = solution.finalAnswer;
    }
  } catch (error) {
    console.error('Failed to fetch solution steps:', error);
    // Continue without solution steps - they might not exist yet
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: {
      ...response.data.data,
      solutionSteps,
      finalAnswer,
    },
  };
}

/**
 * Create new exercise
 */
export async function createExercise(
  data: CreateExerciseRequest
): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.post<ExerciseResponse>(
    API_ENDPOINTS.EXERCISES_CREATE,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to create exercise');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update exercise
 */
export async function updateExercise(
  id: string,
  data: UpdateExerciseRequest
): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.put<ExerciseResponse>(
    API_ENDPOINTS.EXERCISES_UPDATE(id),
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to update exercise');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Delete exercise
 */
export async function deleteExercise(id: string): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(
    API_ENDPOINTS.EXERCISES_DELETE(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to delete exercise');
  }
  
  return response.data;
}

/**
 * Get exercises by skill
 */
export async function getExercisesBySkill(
  skillId: string
): Promise<ResponseObject<PageResponse<Exercise>>> {
  const response = await apiClient.get<ExerciseListResponseData>(
    API_ENDPOINTS.EXERCISES_BY_SKILL(skillId)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercises by skill');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get exercise statistics
 */
export async function getExerciseStats(
  id: string
): Promise<ResponseObject<ExerciseStatsResponse>> {
  const response = await apiClient.get<ResponseObject<ExerciseStatsResponse>>(
    API_ENDPOINTS.EXERCISES_STATS(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercise stats');
  }
  
  return response.data;
}

/**
 * Review exercise (approve/reject/needs-revision)
 */
export async function reviewExercise(
  id: string,
  data: ReviewExerciseRequest
): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.post<ExerciseResponse>(
    API_ENDPOINTS.EXERCISES_REVIEW(id),
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to review exercise');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get review history for exercise
 */
export async function getReviewHistory(
  id: string
): Promise<ResponseObject<ReviewHistoryResponse>> {
  const response = await apiClient.get<ResponseObject<ReviewHistoryResponse>>(
    API_ENDPOINTS.EXERCISES_REVIEW_HISTORY(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch review history');
  }
  
  return response.data;
}

/**
 * Generate exercises with AI
 */
export async function generateExercises(
  data: GenerateExercisesRequest
): Promise<ResponseObject<GenerateExercisesResponse>> {
  const response = await apiClient.post<ResponseObject<GenerateExercisesResponse>>(
    API_ENDPOINTS.EXERCISES_GENERATE,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to generate exercises');
  }
  
  return response.data;
}

/**
 * Generate prompt for exercise creation
 */
export async function generatePrompt(
  data: GeneratePromptRequest
): Promise<ResponseObject<GeneratePromptResponse>> {
  const response = await apiClient.post<ResponseObject<GeneratePromptResponse>>(
    API_ENDPOINTS.EXERCISES_GENERATE_PROMPT,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to generate prompt');
  }
  
  return response.data;
}

/**
 * Validate LaTeX in exercise fields
 */
export async function validateLaTeX(
  id: string,
  data: ValidateLaTeXRequest
): Promise<ResponseObject<ValidateLaTeXResponse>> {
  const response = await apiClient.post<ResponseObject<ValidateLaTeXResponse>>(
    API_ENDPOINTS.EXERCISES_VALIDATE_LATEX(id),
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to validate LaTeX');
  }
  
  return response.data;
}

/**
 * Import exercise from JSON
 */
export async function importExerciseFromJson(
  data: ImportExerciseJsonRequest
): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.post<ExerciseResponse>(
    `${API_ENDPOINTS.EXERCISES_LIST}/import-json`,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to import exercise from JSON');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Validate exercise JSON
 */
export async function validateExerciseJson(
  data: ValidateJsonRequest
): Promise<ResponseObject<ValidateJsonResponse>> {
  const response = await apiClient.post<ResponseObject<ValidateJsonResponse>>(
    API_ENDPOINTS.EXERCISES_VALIDATE_JSON,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to validate JSON');
  }
  
  return response.data;
}

/**
 * Check exercise JSON (comprehensive validation with error codes)
 */
export async function checkExerciseJson(
  data: CheckJsonRequest
): Promise<ResponseObject<CheckJsonResponse>> {
  const response = await apiClient.post<ResponseObject<CheckJsonResponse>>(
    API_ENDPOINTS.EXERCISES_CHECK_JSON,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to check JSON');
  }
  
  return response.data;
}

/**
 * Fix exercise JSON based on error codes
 */
export async function fixExerciseJson(
  data: FixJsonRequest
): Promise<ResponseObject<FixJsonResponse>> {
  const response = await apiClient.post<ResponseObject<FixJsonResponse>>(
    API_ENDPOINTS.EXERCISES_FIX_JSON,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fix JSON');
  }
  
  return response.data;
}

/**
 * Check exercise LaTeX (comprehensive validation with error codes)
 */
export async function checkExerciseLaTeX(
  id: string,
  data: CheckLaTeXRequest
): Promise<ResponseObject<CheckLaTeXResponse>> {
  const response = await apiClient.post<ResponseObject<CheckLaTeXResponse>>(
    API_ENDPOINTS.EXERCISES_CHECK_LATEX(id),
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to check LaTeX');
  }
  
  return response.data;
}

/**
 * Fix exercise LaTeX based on error codes
 */
export async function fixExerciseLaTeX(
  id: string,
  data: FixLaTeXRequest
): Promise<ResponseObject<FixLaTeXResponse>> {
  const response = await apiClient.post<ResponseObject<FixLaTeXResponse>>(
    API_ENDPOINTS.EXERCISES_FIX_LATEX(id),
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fix LaTeX');
  }
  
  return response.data;
}

/**
 * Create exercise solution
 */
export async function createExerciseSolution(
  exerciseId: string,
  data: CreateExerciseSolutionRequest
): Promise<ResponseObject<any>> {
  const response = await apiClient.post<ResponseObject<any>>(
    `${API_ENDPOINTS.EXERCISES_GET(exerciseId)}/solutions`,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to create exercise solution');
  }
  
  return response.data;
}
