import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/Tabs';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/src/contexts/AuthContext';

export const SignInPage = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If already logged in, redirect to app
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/app/map';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const getAuthErrorMessage = (error: any) => {
    const code = error.code || '';
    
    switch (code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please double-check your credentials and try again.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Would you like to create one?';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/weak-password':
        return 'Your password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'The email address provided is not valid.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is not enabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Access has been temporarily disabled. Please try again later.';
      case 'auth/network-request-failed':
        return 'A network error occurred. Please check your internet connection and try again.';
      case 'auth/popup-blocked':
        return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in process was cancelled before it could finish.';
      default:
        // Clean up raw Firebase errors if they fall through
        return error.message?.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', '') || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);
      await signInWithEmail(email, password);
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);
      await signUpWithEmail(email, password);
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 relative flex items-center justify-center w-full min-h-[calc(100vh-64px)] overflow-hidden bg-surface-50">
      <div className="flex-1 flex max-w-5xl mx-auto items-center justify-center p-4 w-full gap-12 relative z-10">
        <div className="hidden lg:flex flex-col max-w-sm justify-center space-y-8 pr-8">
          <div>
             <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-surface-200 text-surface-600 text-[10px] font-bold uppercase tracking-wider mb-6 shadow-sm">
               SECURE WORKSPACE
             </div>
             <h2 className="text-4xl font-bold tracking-tight text-surface-900 leading-[1.15]">
               Elevate your spatial analysis.
             </h2>
          </div>
          
          <ul className="space-y-6 text-surface-600 text-base">
             <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 font-semibold shadow-sm">1</div>
                <div className="pt-1">
                  <strong className="block text-surface-900 mb-1">Persistent Workspaces</strong>
                  Save and restore complex map states, active layers, and zoom levels across sessions.
                </div>
             </li>
             <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-semibold shadow-sm">2</div>
                <div className="pt-1">
                  <strong className="block text-surface-900 mb-1">Private Annotations</strong>
                  Draw and annotate securely on candidate sites. Your data is strictly segmented.
                </div>
             </li>
             <li className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200 font-semibold shadow-sm">?</div>
                <div className="pt-1">
                  <strong className="block text-surface-900 mb-1">Guest Access Limitations</strong>
                  Guests can view public queries and explore the map, but cannot save states or view advanced analytical overlays.
                </div>
             </li>
          </ul>
        </div>

        <Card className="w-full max-w-md shrink-0 shadow-lg border-surface-200 bg-white">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access your private workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 border border-red-100 p-2.5 rounded-md">{error}</div>}
          
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="w-full mb-6 grid grid-cols-2">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="google" className="space-y-4">
              <Button className="w-full" size="lg" onClick={handleGoogleSignIn} disabled={isLoading}>
                 {isLoading ? 'Connecting...' : 'Sign in with Google'}
              </Button>
            </TabsContent>
            
            <TabsContent value="email">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="w-full mb-4 grid grid-cols-2 bg-transparent text-xs p-0 border-b border-surface-200 rounded-none h-auto">
                   <TabsTrigger value="login" className="rounded-none border-b-2 border-transparent data-[state=active]:border-surface-900 data-[state=active]:shadow-none data-[state=active]:bg-transparent pb-2">Log In</TabsTrigger>
                   <TabsTrigger value="signup" className="rounded-none border-b-2 border-transparent data-[state=active]:border-surface-900 data-[state=active]:shadow-none data-[state=active]:bg-transparent pb-2">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                       {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                       {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

        </CardContent>
        <CardFooter className="flex justify-center border-t border-surface-100 pt-6">
          <Button variant="ghost" asChild>
            <Link to="/app/map">Continue as guest</Link>
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
};
