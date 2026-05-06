import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { motion } from 'motion/react';
import { WebGLBackground } from '@/components/ui/WebGLBackground';
import { ShieldCheck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex-1 relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      <WebGLBackground className="opacity-50 mix-blend-screen" />
      <motion.div 
         initial={{ opacity: 0, y: 20, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
         className="flex flex-col items-center justify-center p-4 w-full relative z-10"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-900/50 rounded-2xl flex items-center justify-center border border-white/10 mb-5 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/20">
            <MapPin className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-2 font-display">Access Terminal</h2>
          <p className="text-slate-400 text-sm font-light tracking-wide">Authenticate to secure spatial workspace</p>
        </div>

        <Card 
          className={cn(
            "w-full max-w-sm shrink-0 border-white/10 bg-slate-900/40 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative rounded-[2rem] overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.05] before:to-transparent before:pointer-events-none",
            !isLowGPU && "backdrop-blur-2xl"
          )}
        >
          <CardContent className="p-8 space-y-8">
            <form onSubmit={handleEmailSignIn} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] uppercase font-semibold tracking-widest text-cyan-400/80 pl-1">Email Designation</label>
                  <Input id="email" type="email" placeholder="name@company.com" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 min-h-[50px] rounded-xl px-4 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 ring-offset-0 transition-all font-mono text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-[10px] uppercase font-semibold tracking-widest text-cyan-400/80 pl-1">Security Key</label>
                  <Input id="password" type="password" placeholder="••••••••" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 min-h-[50px] rounded-xl px-4 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 ring-offset-0 transition-all font-mono text-sm tracking-widest" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <div className="text-[11px] font-bold text-rose-400 mt-2 flex items-center gap-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 uppercase tracking-wider"><ShieldCheck className="h-4 w-4 shrink-0" />{error}</div>}
              </div>
              <Button type="submit" className="w-full bg-cyan-600 flex items-center justify-center hover:bg-cyan-500 text-white min-h-[52px] font-bold tracking-wide text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] border border-cyan-400/20" disabled={isLoading || isGoogleLoading}>
                {isLoading ? 'Decrypting...' : 'Initialize Session'}
              </Button>
            </form>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-bold">
                <span className="bg-slate-900/80 px-3 text-slate-500 backdrop-blur-sm rounded-full border border-white/5">Demo Auth</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-[10px] font-mono border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-0"
                onClick={() => { setEmail('superadmin@example.com'); setPassword('password123'); }}
              >
                Root
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-[10px] font-mono border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-0"
                onClick={() => { setEmail('admin@companya.com'); setPassword('password123'); }}
              >
                Admin
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-[10px] font-mono border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-0"
                onClick={() => { setEmail('user1@companya.com'); setPassword('password123'); }}
              >
                User
              </Button>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-white min-h-[50px] rounded-xl transition-all mt-4" 
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                'Connecting...'
              ) : (
                <div className="flex items-center justify-center gap-3 font-semibold text-sm">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
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
          <CardFooter className="flex flex-col gap-5 bg-white/[0.02] p-8 pt-6 border-t border-white/5">
             <div className="text-center w-full">
              <p className="text-xs text-slate-500 font-light">
                Need specialized access? <Link to="/sign-up" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Create Account</Link>
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-4">
              <Button variant="ghost" className="text-slate-500 hover:text-slate-300 min-h-[40px] text-[10px] font-bold uppercase tracking-widest px-0 hover:bg-transparent" asChild>
                <Link to="/app/map">Guest Entry</Link>
              </Button>
              <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 bg-cyan-400/5 hover:bg-cyan-400/10 border border-cyan-400/10 min-h-[40px] text-[10px] font-bold uppercase tracking-widest px-4 rounded-lg transition-all" asChild>
                <Link to="/register-tenant">Organization</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-600 uppercase tracking-[0.4em] font-mono font-bold mt-2">
              <ShieldCheck className="h-3 w-3 text-cyan-500/50" />
              <span>Encrypted Relay</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
