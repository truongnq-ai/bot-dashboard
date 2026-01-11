/**
 * Reference Data Initializer
 * Wrapper component that initializes reference data after login
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useReferenceData } from '@/context/ReferenceDataContext';

export default function ReferenceDataInitializer({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { init, loaded } = useReferenceData();

    useEffect(() => {
        if (isAuthenticated && !loaded) {
            init().catch((error) => {
                console.warn('Failed to initialize reference data:', error);
            });
        }
    }, [isAuthenticated, loaded, init]);

    return <>{children}</>;
}
