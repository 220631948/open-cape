import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { Map, FolderKanban, Bookmark, MapPin, User as UserIcon, Settings, Search, Menu, X, Bell, LogOut } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { to: '/app/map', icon: Map, label: 'Map' },
    { to: '/app/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/app/saved-maps', icon: Bookmark, label: 'Saved Maps' },
  ];

  const bottomNavItems = [
    { to: '/app/profile', icon: UserIcon, label: 'Profile' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
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
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-surface-800 shrink-0">
          <div className="w-8 h-8 bg-rose-500 rounded shrink-0 flex items-center justify-center text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="ml-3 font-semibold text-white leading-tight tracking-tight text-sm hidden lg:block">
            CapeTown Urban<br/><span className="text-surface-400 font-normal">Property Intelligence</span>
          </div>
        </div>
        
        <div className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors group text-sm font-medium",
                isActive 
                  ? "bg-surface-800 text-white" 
                  : "text-surface-300 hover:bg-surface-800 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "opacity-70" : "opacity-50 group-hover:opacity-70")} />
                  <span className="hidden lg:block">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-surface-800 flex flex-col gap-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors group text-sm font-medium",
                isActive 
                  ? "bg-surface-800 text-white" 
                  : "text-surface-300 hover:bg-surface-800 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "opacity-70" : "opacity-50 group-hover:opacity-70")} />
                  <span className="hidden lg:block">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => { setMobileMenuOpen(false); logout(); }}
            className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors group text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white w-full text-left"
          >
            <LogOut className="h-5 w-5 shrink-0 opacity-50 group-hover:opacity-70 transition-colors" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Command Bar */}
        <header className="h-16 flex-shrink-0 border-b border-surface-200 bg-white flex items-center justify-between px-6 z-20">
          <div className="flex-1 flex items-center max-w-xl">
             <div className="relative w-full max-w-md hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-surface-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search parcels, streets, or coordinates..."
                className="block w-full pl-10 pr-3 py-2 border border-surface-200 rounded-md leading-5 bg-surface-50 placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-400 text-sm"
                disabled
              />
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
              <div className="h-8 w-8 rounded-full bg-surface-700 text-white flex items-center justify-center text-xs font-bold ml-2">
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
          {/* Detail drawer shell (optional/contextual) */}
          <aside className="w-80 border-l border-surface-200 bg-white hidden xl:flex flex-col flex-shrink-0">
             <div className="p-4 border-b border-surface-200">
               <h3 className="font-semibold text-surface-900">Details</h3>
             </div>
             <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-surface-400">
               <p className="text-sm">Select an item on the map to view details</p>
             </div>
          </aside>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-surface-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};
