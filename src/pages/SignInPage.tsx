import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/src/contexts/AuthContext';

export const SignInPage = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to app
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/app/map';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      // user effect will catch the redirect
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access your private workspace and saved maps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-md">{error}</div>}
          <Button className="w-full" size="lg" onClick={handleSignIn} disabled={isLoading}>
             {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-surface-100 pt-6">
          <Button variant="ghost" asChild>
            <Link to="/">Return home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
