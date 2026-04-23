import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Skeleton } from '@/src/components/ui/Skeleton';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-50">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <p className="text-sm text-surface-500 font-medium">Verifying workspace access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
