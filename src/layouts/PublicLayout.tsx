import React from 'react';
import { Outlet, Link } from 'react-router';
import { Map, MapPin } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/contexts/AuthContext';

export const PublicLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-900">
      <header className="sticky top-0 z-50 w-full border-b border-surface-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-rose-500 rounded flex items-center justify-center text-white shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="font-semibold text-surface-900 leading-tight tracking-tight text-sm hidden sm:block">
              CapeTown Urban<br/><span className="text-surface-500 font-normal">Property Intelligence</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-surface-600">
            <Link to="/sources" className="hover:text-surface-900 transition-colors">Sources</Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link to="/app/map">Go to Workspace</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/app/map">Explore Map</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      
      <footer className="border-t border-surface-200 bg-white py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-surface-500">
            &copy; {new Date().getFullYear()} CapeTown Urban Property Intelligence. Data transparency is our priority.
          </p>
          <div className="flex items-center gap-4 text-sm text-surface-500">
            <Link to="/sources" className="hover:text-surface-800">Source Catalog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
