import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { auth } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { WebGLBackground } from '@/src/components/ui/WebGLBackground';
import { ShieldCheck, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export const SignInPage = () => {
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tenantId = searchParams.get('tenantId');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLowGPU, setIsLowGPU] = useState(false);
  
  useEffect(() => {
    const gpuTier = navigator.hardwareConcurrency || 4;
    setIsLowGPU(window.innerWidth < 768 && gpuTier < 4);
    if (tenantId) {
      auth.tenantId = tenantId;
    } else {
      auth.tenantId = null;
    }
  }, [tenantId]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/app/map';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const getAuthErrorMessage = (error: unknown) => {
    const code = typeof error === 'object' && error !== null && 'code' in error ? (error as any).code : '';
    switch (code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/user-not-found':
        return 'No account found. Please register an organization first.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window was closed.';
      case 'auth/cancelled-by-user':
        return 'Sign-in was cancelled.';
      default:
        return 'An unexpected error occurred.';
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      console.error(err);
      setError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setError(getAuthErrorMessage(err));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex-1 relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-surface-950 text-surface-50 selection:bg-rose-500/30">
      <WebGLBackground className="opacity-40" />
      <motion.div 
         initial={{ opacity: 0, y: 20, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
         className="flex flex-col items-center justify-center p-4 w-full relative z-10"
      >
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mb-6 backdrop-blur-xl rotate-3 shadow-2xl">
            <MapPin className="h-8 w-8 text-white opacity-80" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-3 font-display">Welcome Back</h2>
          <p className="text-surface-400 font-light tracking-wide italic">Enter your secure spatial workspace</p>
        </div>

        <Card 
          className={cn(
            "w-full max-w-sm shrink-0 border-white/10 bg-surface-900/40 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative rounded-[2.5rem] overflow-hidden",
            !isLowGPU && "backdrop-blur-3xl"
          )}
        >
          <CardContent className="p-10 space-y-8">
            <form onSubmit={handleEmailSignIn} className="space-y-6">
              <div className="space-y-4">
                <Input type="email" placeholder="Email address" className="bg-surface-800/50 border-white/5 text-white placeholder:text-surface-500 min-h-[56px] rounded-2xl px-5 focus:ring-indigo-500 ring-offset-surface-950" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email Address" />
                <Input type="password" placeholder="Password" className="bg-surface-800/50 border-white/5 text-white placeholder:text-surface-500 min-h-[56px] rounded-2xl px-5 focus:ring-indigo-500 ring-offset-surface-950" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label="Password" />
                {error && <div className="text-[11px] font-bold text-rose-400 mt-2 flex items-center gap-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 uppercase tracking-wider"><ShieldCheck className="h-4 w-4" />{error}</div>}
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white min-h-[60px] font-bold text-base rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] border-0" disabled={isLoading || isGoogleLoading}>
                {isLoading ? 'Decrypting...' : 'Enter Platform'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                <span className="bg-surface-900/80 px-4 text-surface-500 backdrop-blur-sm rounded-full border border-white/5">Identity Check</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-white min-h-[56px] rounded-2xl transition-all" 
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                'Connecting...'
              ) : (
                <div className="flex items-center justify-center gap-3 font-semibold">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google SSO
                </div>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 bg-white/[0.02] p-10 pt-8 border-t border-white/5">
            <div className="text-center w-full">
              <p className="text-xs text-surface-500 font-light">
                Need specialized access? <Link to="/sign-up" className="text-white hover:text-indigo-400 font-bold underline underline-offset-4 decoration-white/20 transition-colors">Create Account</Link>
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-4">
              <Button variant="ghost" className="text-surface-500 hover:text-white min-h-[44px] text-[11px] font-bold uppercase tracking-widest px-0 hover:bg-transparent" asChild>
                <Link to="/app/map">Guest Entry</Link>
              </Button>
              <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 min-h-[44px] text-[11px] font-bold uppercase tracking-widest px-4 rounded-xl" asChild>
                <Link to="/register-tenant">Organization</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-surface-600 uppercase tracking-[0.4em] font-mono font-bold">
              <ShieldCheck className="h-3 w-3 text-emerald-500/50" />
              <span>Bit-Level Encryption</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
