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