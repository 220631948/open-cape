import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { createTenant } from '@/src/lib/tenancy';
import { Building2, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { WebGLBackground } from '@/src/components/ui/WebGLBackground';

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
      await createTenant(tenantName);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 p-4 font-sans relative overflow-hidden selection:bg-rose-500/30">
      <WebGLBackground className="opacity-40" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-10">
          <div className="flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-3xl mb-8 mx-auto rotate-3">
            <Building2 className="w-10 h-10 text-indigo-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-center text-surface-950 mb-3 tracking-tight font-display">Establish Workspace</h1>
          <p className="text-surface-500 text-center mb-10 font-light style-text-balance">
            Create a secure, isolated workspace for your team and geospatial data operations.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="tenantName" className="block text-[10px] font-bold text-surface-400 uppercase tracking-[0.3em] font-mono ml-1">
                Organization Identity
              </label>
              <input
                id="tenantName"
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="e.g. Cape Real Estate Hub"
                className="w-full px-5 py-4 bg-surface-50 border border-surface-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-surface-300"
              />
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                <p className="font-bold mb-1 uppercase tracking-wider text-emerald-700">Enterprise Security</p>
                <p className="opacity-80">Strong data isolation enabled. All GeoJSON imports and internal records are private strictly to your organization.</p>
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !tenantName.trim()}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group shadow-xl shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Register Workspace
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="p-8 bg-surface-50/50 border-t border-surface-100 text-center">
          <p className="text-[10px] text-surface-400 font-bold uppercase tracking-[0.2em] font-mono">
            Provisioned for Cape Town Metropolitan Region
          </p>
        </div>
      </motion.div>
    </div>
  );
};
