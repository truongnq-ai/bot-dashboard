/**
 * Exercise Status Mapper
 * Maps between ExerciseStatus (backend) and ReviewStatus (frontend)
 */

// Backend ExerciseStatus enum values
export enum ExerciseStatus {
  DRAFT = 'DRAFT',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
}

import { ReviewStatus } from '@/types/exercise';

/**
 * Map ExerciseStatus (backend) to ReviewStatus (frontend)
 * DRAFT and REVIEWED both map to PENDING (Chờ duyệt)
 * APPROVED maps to APPROVED (Đã duyệt)
 */
export function mapExerciseStatusToReviewStatus(status: ExerciseStatus | string): ReviewStatus {
  if (status === ExerciseStatus.APPROVED || status === 'APPROVED') {
    return ReviewStatus.APPROVED;
  }
  // DRAFT and REVIEWED both map to PENDING
  return ReviewStatus.PENDING;
}

/**
 * Map ReviewStatus (frontend) to ExerciseStatus (backend)
 * Note: PENDING doesn't map directly - need to handle separately
 */
export function mapReviewStatusToExerciseStatus(status: ReviewStatus): ExerciseStatus | null {
  if (status === ReviewStatus.APPROVED) {
    return ExerciseStatus.APPROVED;
  }
  // PENDING doesn't map directly - frontend will filter by DRAFT or REVIEWED separately
  return null;
}

