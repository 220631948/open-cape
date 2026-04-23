import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/Card';
import { useAuth } from '@/src/contexts/AuthContext';
import { Badge } from '@/src/components/ui/Badge';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Profile</h1>
        <p className="text-surface-500">Manage your personal information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Your identity is securely managed by Firebase.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-surface-50 border border-surface-200 rounded-lg flex flex-col md:flex-row gap-6 items-start md:items-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="h-20 w-20 rounded-full border-4 border-white shadow-sm" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-surface-700 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-lg text-surface-900">{user?.displayName || 'Unknown User'}</h3>
                <p className="text-surface-500">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user?.emailVerified ? 'success' : 'secondary'}>
                  {user?.emailVerified ? 'Email Verified' : 'Unverified'}
                </Badge>
                <div className="text-xs text-surface-400 font-mono">ID: {user?.uid.substring(0, 8)}...</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
