'use client';

import { AuthGuard } from '@/components/ui/AuthGuard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

function DashboardContent() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                {user && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Welcome, {user.fullName}!</h2>
                        <p className="text-gray-600">Email: {user.email}</p>
                        <img
                            src={user.avatar}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full mt-4"
                        />
                    </div>
                )}
                <Button onClick={handleLogout} variant="secondary">
                    Logout
                </Button>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <DashboardContent />
        </AuthGuard>
    );
}