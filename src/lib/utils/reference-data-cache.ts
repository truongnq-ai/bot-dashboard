/**
 * Reference Data Cache Utilities
 * Manages localStorage for subjects and topics with version control
 */

import { Subject } from '@/types/subject';
import { Topic } from '@/types/topic';

// Cache keys
export const CACHE_KEYS = {
    SUBJECTS: 'tad_subjects_v1', // tad = tutor-admin-dashboard
    TOPICS: 'tad_topics_v1',
    VERSION: 'tad_ref_version',
} as const;

// Current cache version (YYYY-MM-DD format)
export const CURRENT_VERSION = '2026-01-06';

/**
 * Get cached subjects from localStorage
 */
export function getCachedSubjects(): Subject[] | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const cached = localStorage.getItem(CACHE_KEYS.SUBJECTS);
        if (!cached) {
            return null;
        }
        return JSON.parse(cached) as Subject[];
    } catch (error) {
        console.warn('Failed to parse cached subjects:', error);
        return null;
    }
}

/**
 * Get cached topics from localStorage
 */
export function getCachedTopics(): Topic[] | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const cached = localStorage.getItem(CACHE_KEYS.TOPICS);
        if (!cached) {
            return null;
        }
        return JSON.parse(cached) as Topic[];
    } catch (error) {
        console.warn('Failed to parse cached topics:', error);
        return null;
    }
}

/**
 * Get cache version from localStorage
 */
export function getCacheVersion(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem(CACHE_KEYS.VERSION);
}

/**
 * Set cached subjects to localStorage
 */
export function setCachedSubjects(subjects: Subject[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(CACHE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (error) {
        console.warn('Failed to cache subjects:', error);
    }
}

/**
 * Set cached topics to localStorage
 */
export function setCachedTopics(topics: Topic[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(CACHE_KEYS.TOPICS, JSON.stringify(topics));
    } catch (error) {
        console.warn('Failed to cache topics:', error);
    }
}

/**
 * Set cache version to localStorage
 */
export function setCacheVersion(version: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(CACHE_KEYS.VERSION, version);
    } catch (error) {
        console.warn('Failed to set cache version:', error);
    }
}

/**
 * Clear all cache keys
 */
export function clearCache(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(CACHE_KEYS.SUBJECTS);
        localStorage.removeItem(CACHE_KEYS.TOPICS);
        localStorage.removeItem(CACHE_KEYS.VERSION);
    } catch (error) {
        console.warn('Failed to clear cache:', error);
    }
}

/**
 * Check if cached version matches current version
 */
export function isVersionValid(): boolean {
    const cachedVersion = getCacheVersion();
    return cachedVersion === CURRENT_VERSION;
}
