/**
 * Formatter Utilities
 */

import { ExerciseType } from '@/types/exercise';

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return '-';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time to locale string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) {
    return '-';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  return dateObj.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/**
 * Format ID to show only last 3 characters with ellipsis prefix
 * Example: "019b452c-e31e-75b3-b7d9-02cd5b31459d" -> "...59d"
 */
export function formatIdShort(id: string | null | undefined): string {
  if (!id) {
    return '';
  }
  if (id.length <= 3) {
    return id;
  }
  return '...' + id.slice(-3);
}

/**
 * Exercise Type Utilities
 */

/**
 * Map ExerciseType enum to Vietnamese display name
 */
export function getExerciseTypeName(type?: ExerciseType): string {
  if (!type) return '-';

  const typeMap: Record<ExerciseType, string> = {
    [ExerciseType.MULTIPLE_CHOICE]: 'Trắc nghiệm',
    [ExerciseType.SHORT_ANSWER]: 'Trả lời ngắn',
    [ExerciseType.ESSAY]: 'Tự luận',
    [ExerciseType.FILL_IN_BLANK]: 'Điền khuyết',
    [ExerciseType.MATCHING]: 'Nối / ghép',
    [ExerciseType.TRUE_FALSE]: 'Đúng / Sai',
  };

  return typeMap[type] || type;
}

/**
 * Get all exercise types with their display names for dropdowns
 */
export function getExerciseTypeOptions(): Array<{ value: ExerciseType; label: string }> {
  return [
    { value: ExerciseType.MULTIPLE_CHOICE, label: 'Trắc nghiệm' },
    { value: ExerciseType.SHORT_ANSWER, label: 'Trả lời ngắn' },
    { value: ExerciseType.ESSAY, label: 'Tự luận' },
    { value: ExerciseType.FILL_IN_BLANK, label: 'Điền khuyết' },
    { value: ExerciseType.MATCHING, label: 'Nối / ghép' },
    { value: ExerciseType.TRUE_FALSE, label: 'Đúng / Sai' },
  ];
}

/**
 * Format time estimate in seconds to human-readable format
 * Examples: 45 -> "45 giây", 90 -> "1 phút 30 giây", 120 -> "2 phút"
 */
export function formatTimeEstimate(seconds?: number | null): string {
  if (!seconds || seconds <= 0) {
    return '-';
  }

  if (seconds < 60) {
    return `${seconds} giây`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} phút`;
  }

  return `${minutes} phút ${remainingSeconds} giây`;
}

/**
 * Difficulty Utilities
 */

/**
 * Get difficulty label in Vietnamese format
 * Examples: 1 -> "1 - Rất dễ", 3 -> "3 - Trung bình", 5 -> "5 - Rất khó"
 */
export function getDifficultyLabel(difficulty?: number | null): string {
  if (!difficulty || difficulty < 1 || difficulty > 5) {
    return '-';
  }

  const labels: Record<number, string> = {
    1: '1 - Rất dễ',
    2: '2 - Dễ',
    3: '3 - Trung bình',
    4: '4 - Khó',
    5: '5 - Rất khó',
  };

  return labels[difficulty] || '-';
}