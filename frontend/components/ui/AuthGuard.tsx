'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                router.push(redirectTo);
            } else if (!requireAuth && isAuthenticated) {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (!requireAuth && isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};