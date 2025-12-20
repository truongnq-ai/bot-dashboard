/**
 * Formatter Utilities
 */

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
  return dateObj.toLocaleDateString('en-US', {
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
  return dateObj.toLocaleString('en-US', {
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
