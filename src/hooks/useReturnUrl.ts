/**
 * useReturnUrl Hook
 * 
 * Hook to handle return URL navigation with fallback support.
 * Supports query parameter 'from' and browser history fallback.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook to handle return URL navigation
 * 
 * @param defaultUrl - Default URL to navigate to if no 'from' parameter and no browser history
 * @returns Object with goBack function
 */
export function useReturnUrl(defaultUrl: string = '/') {
    const router = useRouter();
    const searchParams = useSearchParams();

    const goBack = useCallback(() => {
        const from = searchParams.get('from');
        if (from) {
            try {
                const decodedUrl = decodeURIComponent(from);
                // Validate that the URL is safe (starts with /)
                if (decodedUrl.startsWith('/')) {
                    router.push(decodedUrl);
                } else {
                    // Invalid URL, fallback to default
                    router.push(defaultUrl);
                }
            } catch (error) {
                // If decode fails, fallback to default
                router.push(defaultUrl);
            }
        } else if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(defaultUrl);
        }
    }, [router, searchParams, defaultUrl]);

    return { goBack };
}
