'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requireAuth = true,
    redirectTo = '/login',
}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (!isLoading && !hasRedirected.current) {
            if (requireAuth && !isAuthenticated) {
                hasRedirected.current = true;
                router.replace(redirectTo);
            } else if (!requireAuth && isAuthenticated) {
                hasRedirected.current = true;
                router.replace('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

    // Reset redirect flag when auth state changes
    useEffect(() => {
        hasRedirected.current = false;
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (!requireAuth && isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};