import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { Map, FolderKanban, Bookmark, MapPin, User as UserIcon, Settings, Menu, X, Bell, LogOut, Database, Pencil, MessageSquare, Layers, Users, Shield, CheckSquare, ShieldAlert, WifiOff } from 'lucide-react';
import { CompareTray } from '@/components/compare/CompareTray';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useNotifications } from '@/hooks/useNotifications';
import AlgoliaSearch from '@/components/SearchBox';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isImpersonating, stopImpersonation } = useImpersonation();
  const isOnline = useNetworkStatus();
  const { unreadCount } = useNotifications();
  
  const handleStopImpersonating = async () => {
    try {
      await stopImpersonation();
      window.location.reload();
    } catch (e: any) {
      alert("Failed to return: " + e.message);
    }
  };

  const navItems = [
    { to: '/app/map', icon: Map, label: 'Interactive Map', public: true },
    { to: '/app/tasks', icon: CheckSquare, label: 'Tasks', public: false },
    { to: '/app/areas', icon: Layers, label: 'Areas & Precincts', public: false },
    { to: '/app/projects', icon: FolderKanban, label: 'Projects', public: false },
    { to: '/app/team', icon: Users, label: 'Organization Team', public: false },
    { to: '/app/roles', icon: Shield, label: 'Roles', public: false },
    { to: '/app/settings', icon: Settings, label: 'Org Settings', public: false },
    { to: '/app/drawings', icon: Pencil, label: 'Drawings', public: false },
    { to: '/app/annotations', icon: MessageSquare, label: 'Notes', public: false },
    { to: '/app/bookmarks', icon: Bookmark, label: 'Bookmarks', public: false },
    { to: '/app/watchlists', icon: Bell, label: 'Alert Watchlists', public: false },
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
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          title={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
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
                {item.to === '/app/watchlists' && unreadCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 animate-pulse">
                    {unreadCount}
                  </span>
                )}
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
        {!isOnline && (
          <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-center shrink-0 w-full animate-in slide-in-from-top">
            <WifiOff className="w-4 h-4 mr-2" />
            You are offline. Map tiles will load from cache if available.
          </div>
        )}
        {isImpersonating && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>You are currently impersonating {user?.email}.</span>
            </div>
            <button 
              onClick={handleStopImpersonating}
              className="px-3 py-1 bg-amber-950 text-amber-50 rounded hover:bg-amber-900 transition-colors shadow-sm"
            >
              Return to Admin
            </button>
          </div>
        )}
        {/* Top Command Bar */}
        <header className="h-16 flex-shrink-0 border-b border-surface-200 bg-white flex items-center justify-between px-6 z-20">
          <div className="flex-1 flex items-center max-w-xl">
             <div className="relative w-full max-w-md hidden sm:block relative z-50">
                <AlgoliaSearch onSelect={(hit) => {
                  const lng = hit.lng || hit._geoloc?.lng || hit.location?.lng;
                  const lat = hit.lat || hit._geoloc?.lat || hit.location?.lat;
                  if (lng && lat) {
                    navigate('/app/map', { state: { focusErf: { id: hit.objectID || hit.id, center: { lng, lat } } } });
                  } else {
                    console.warn("Selected hit lacks coordinates", hit);
                  }
                }} />
             </div>
            <span className="sm:hidden font-medium">CapeTown Urban Prop</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-surface-500 relative hidden sm:flex hover:bg-surface-100" 
              onClick={() => navigate('/app/watchlists')}
              aria-label="View watchlists and notifications"
              title="View watchlists and notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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
