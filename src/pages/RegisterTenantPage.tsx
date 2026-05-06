import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { Building2, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { WebGLBackground } from '@/components/ui/WebGLBackground';

export const RegisterTenantPage: React.FC = () => {
  const [tenantName, setTenantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get ID Token
      const idToken = await user.getIdToken();

      // Call backend to create tenant and assign claims
      const res = await fetch('/api/register-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ tenantName })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register tenant');
      }

      // 4. Sign in again with the new custom token to refresh claims immediately
      await signInWithCustomToken(auth, data.customToken);

      navigate('/app/map');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register tenant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden">
        <WebGLBackground className="opacity-20 pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-surface-200 shadow-2xl max-w-sm w-full relative z-10"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-3 tracking-tight">Organization Registration</h2>
          <p className="text-surface-600 mb-8 text-sm leading-relaxed">Please create an account or sign in to establish your organization's workspace.</p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl">
              <Link to="/sign-up">Create Account</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full h-12 rounded-xl hover:bg-surface-100">
              <Link to="/sign-in">Sign In Instead</Link>
            </Button>
          </div>
          <p className="mt-6 text-[10px] text-surface-400 uppercase tracking-widest font-semibold">Secure Professional Access</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden text-slate-50 selection:bg-cyan-500/30">
      <WebGLBackground className="opacity-50 mix-blend-screen" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden border border-white/10 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.05] before:to-transparent before:pointer-events-none"
      >
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-center w-14 h-14 bg-slate-900/50 rounded-xl flex-col border border-white/10 mb-5 mx-auto backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/20">
            <Building2 className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          </div>
          
          <div className="text-center">
             <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight font-display">Provision Tenant</h1>
             <p className="text-slate-400 text-sm font-light">
               Establish an isolated workspace for spatial data operations.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="tenantName" className="block text-[10px] uppercase font-semibold tracking-widest text-cyan-400/80 ml-1">
                Organization Designation
              </label>
              <input
                id="tenantName"
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="e.g. Cape Real Estate Hub"
                className="w-full bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 min-h-[50px] rounded-xl px-4 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 ring-offset-0 transition-all font-mono text-sm"
              />
            </div>

            <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-4 flex gap-4">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-cyan-100/70 leading-relaxed font-mono">
                <p className="font-bold mb-1 uppercase tracking-wider text-cyan-400">Enterprise Isolation</p>
                <p>Strict data segregation enabled. Vector sources and layers are secured via RBAC and Firewalls.</p>
              </div>
            </div>

            {error && (
              <div className="text-[11px] font-bold text-rose-400 mt-2 flex items-center gap-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !tenantName.trim()}
              className="w-full bg-cyan-600 flex items-center justify-center hover:bg-cyan-500 text-white min-h-[52px] font-bold tracking-wide text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] border border-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed group gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Initialize System
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] font-mono">
            Encrypted Relay Network Active
          </p>
        </div>
      </motion.div>
    </div>
  );
};
