import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { Map, FolderKanban, Bookmark, MapPin, User as UserIcon, Settings, Search, Menu, X, Bell, LogOut, Loader2, Locate, Database, Pencil, MessageSquare, Layers } from 'lucide-react';
import { CompareTray } from '@/src/components/compare/CompareTray';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { useErfSearch } from '@/src/hooks/useErfSearch';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { results, isSearching, searchByErfNumber, searchSuggestions, fetchErfDetails } = useErfSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSelectErf = async (erfId: string) => {
    setShowResults(false);
    setSearchQuery('Fetching details...');
    
    const fullErf = await fetchErfDetails(erfId);
    if (fullErf) {
      setSearchQuery(`${fullErf.erfNumber} ${fullErf.allotmentArea}`);
      navigate('/app/map', { state: { focusErf: fullErf } });
    } else {
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchSuggestions(searchQuery);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { to: '/app/map', icon: Map, label: 'Interactive Map', public: true },
    { to: '/app/areas', icon: Layers, label: 'Areas & Precincts', public: false },
    { to: '/app/projects', icon: FolderKanban, label: 'Projects', public: false },
    { to: '/app/drawings', icon: Pencil, label: 'Drawings', public: false },
    { to: '/app/annotations', icon: MessageSquare, label: 'Notes', public: false },
    { to: '/app/bookmarks', icon: Bookmark, label: 'Bookmarks', public: false },
    { to: '/app/saved-maps', icon: MapPin, label: 'Saved Maps', public: false },
  ];

  const bottomNavItems = [
    { to: '/app/profile', icon: UserIcon, label: 'Profile & Settings' },
    { to: '/sources', icon: Database, label: 'Source Catalog' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 text-surface-900">
      {/* Mobile drawer toggle */}
      <div className="md:hidden fixed z-50 bottom-4 right-4">
        <Button size="icon" className="rounded-full shadow-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Left Navigation Rail */}
      <nav className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-16 md:w-16 lg:w-64 flex flex-col border-r border-surface-800 bg-surface-900 text-surface-300 transition-transform duration-300 ease-in-out",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-surface-800 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-rose-500 rounded shrink-0 flex items-center justify-center text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="ml-3 font-semibold text-white leading-tight tracking-tight text-sm hidden lg:block">
            CapeTown Urban<br/><span className="text-surface-400 font-normal">Property Intelligence</span>
          </div>
        </div>
        
        <div className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isLocked = !user && !item.public;
            const content = (
              <>
                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors duration-200 z-10", isLocked ? "opacity-30" : "opacity-50 group-hover:opacity-70 group-[.active]:opacity-100 group-[.active]:text-white")} />
                <span className="hidden lg:block z-10">{item.label}</span>
                {isLocked && (
                  <span className="hidden lg:block ml-auto text-[10px] uppercase font-bold text-surface-500 bg-surface-800 px-1.5 py-0.5 rounded tracking-wider z-10">Locked</span>
                )}
                <div className="absolute inset-x-0 inset-y-0 bg-surface-800 opacity-0 group-[.active]:opacity-100 rounded-md transition-opacity duration-200" />
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r-md opacity-0 group-[.active]:opacity-100 transition-opacity duration-200" />
              </>
            );

            if (isLocked) {
              return (
                <div key={item.to} className="relative flex items-center gap-3 px-3 py-2 text-sm font-medium text-surface-400 cursor-not-allowed group rounded-md" title="Sign in required">
                  {content}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-200 group text-sm font-medium",
                  isActive ? "text-white active" : "text-surface-300 hover:bg-surface-800 hover:text-white"
                )}
              >
                {content}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-surface-800 flex flex-col gap-1">
          {bottomNavItems.map((item) => {
            const content = (
              <>
                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors duration-200 z-10", "opacity-50 group-hover:opacity-70 group-[.active]:opacity-100 group-[.active]:text-white")} />
                <span className="hidden lg:block z-10 text-sm font-medium">{item.label}</span>
                <div className="absolute inset-x-0 inset-y-0 bg-surface-800 opacity-0 group-[.active]:opacity-100 rounded-md transition-opacity duration-200" />
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r-md opacity-0 group-[.active]:opacity-100 transition-opacity duration-200" />
              </>
            );

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 group text-sm font-medium",
                  isActive ? "text-white active shadow-sm" : "text-surface-300 hover:bg-surface-800 hover:text-white"
                )}
              >
                {content}
              </NavLink>
            );
          })}
          <button
            onClick={() => { setMobileMenuOpen(false); logout(); }}
            className="relative flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 group text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white w-full text-left"
          >
            <LogOut className="h-5 w-5 shrink-0 opacity-50 group-hover:opacity-70 transition-colors z-10" />
            <span className="hidden lg:block z-10">Sign Out</span>
            <div className="absolute inset-x-0 inset-y-0 bg-red-500/10 opacity-0 group-hover:opacity-100 rounded-md transition-opacity duration-200" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Command Bar */}
        <header className="h-16 flex-shrink-0 border-b border-surface-200 bg-white flex items-center justify-between px-6 z-20">
          <div className="flex-1 flex items-center max-w-xl">
             <div className="relative w-full max-w-md hidden sm:block" ref={searchRef}>
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-surface-400">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-rose-500" /> : <Search className="h-4 w-4" />}
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Search ERF numbers... (Cmd+K)"
                className="block w-full pl-10 pr-3 py-2 border border-surface-200 rounded-md leading-5 bg-surface-50 placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm transition-shadow"
              />
              
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-md shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 z-50">
                  {searchQuery.length < 2 && (
                    <div className="p-4 text-xs">
                       <p className="text-surface-500 font-semibold mb-2 uppercase tracking-wider">Search Help</p>
                       <p className="text-surface-600 mb-2 leading-relaxed">Search by ERF Number or Allotment Area to find parcels from the City of Cape Town Open Data Portal.</p>
                       <p className="text-emerald-600 font-medium mt-1">Live Source Connected</p>
                    </div>
                  )}

                  {searchQuery.length >= 2 && results.length === 0 && !isSearching && (
                    <div className="p-4 text-sm text-center text-surface-500">
                      <p>No results found for "{searchQuery}"</p>
                      <p className="text-xs mt-1 text-surface-400">Try a different ERF number or Allotment Area.</p>
                    </div>
                  )}

                  {results.length > 0 && results.map((erf) => (
                    <button
                      key={erf.id}
                      onClick={() => handleSelectErf(erf.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-50 transition-colors text-left border-b border-surface-50 last:border-0"
                    >
                      <div className="h-8 w-8 rounded bg-rose-50 flex items-center justify-center text-rose-600">
                        <Locate className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-surface-900 truncate flex items-center gap-2">
                           ERF {erf.erfNumber}
                           {erf.status === 'live' && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Live Datasets</span>
                           )}
                        </div>
                        <div className="text-xs text-surface-500 truncate">{erf.allotmentArea}</div>
                      </div>
                      <div className="ml-auto text-[10px] font-bold text-surface-500 uppercase tracking-wider shrink-0 bg-surface-100 px-1.5 py-0.5 rounded max-w-[100px] truncate">
                        {erf.zoning || 'Zoning N/A'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="sm:hidden font-medium">CapeTown Urban Prop</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-surface-500 relative disabled:opacity-50 hidden sm:flex" disabled>
              <Bell className="h-5 w-5" />
            </Button>
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="h-8 w-8 rounded-full border border-surface-200 ml-2" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-surface-700 text-white flex items-center justify-center text-xs font-bold ml-2 shadow-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </header>

        {/* Workspace / Content */}
        <main className="flex-1 relative overflow-hidden flex">
          <div className="flex-1 relative overflow-auto">
            <Outlet />
          </div>
          <CompareTray />
        </main>
      </div>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-surface-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};
