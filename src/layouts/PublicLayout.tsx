import React from 'react';
import { Outlet, Link } from 'react-router';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export const PublicLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-surface-950 text-surface-50 relative selection:bg-rose-500/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20 rotate-3">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="font-bold text-white leading-none tracking-tighter text-lg hidden sm:block font-display">
              CapeTown Urban<br/><span className="text-surface-500 font-light text-[11px] uppercase tracking-[0.2em]">Spatial System</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold text-surface-400 uppercase tracking-widest font-mono">
            <Link to="/sources" className="hover:text-white transition-colors">Catalog</Link>
          </nav>
          <div className="flex items-center gap-6">
            {user ? (
              <Button asChild className="rounded-full bg-white text-surface-950 hover:bg-surface-200 font-bold px-8 shadow-xl">
                <Link to="/app/map">Platform</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-surface-400 hover:text-white hover:bg-white/5 font-bold">
                  <Link to="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold px-8 shadow-[0_10px_30px_-5px_rgba(79,70,229,0.4)]">
                  <Link to="/sign-up">Access</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      
      <footer className="border-t border-white/5 bg-surface-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-surface-800 rounded flex items-center justify-center">
                <MapPin className="h-3 w-3 text-surface-400" />
              </div>
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.4em] font-mono">
                CPT-URBAN Spatial Node
              </span>
            </div>
            <p className="text-[11px] text-surface-600 font-medium">
              &copy; {new Date().getFullYear()} CapeTown Urban Property Intelligence. Verified geospatial provenance.
            </p>
          </div>
          <div className="flex items-center gap-8 text-[11px] font-bold text-surface-400 uppercase tracking-[0.2em] font-mono">
            <Link to="/sources" className="hover:text-white transition-colors">Catalog</Link>
            <span className="w-1 h-1 bg-surface-800 rounded-full" />
            <span className="text-emerald-500/50">Service Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
