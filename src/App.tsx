/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from '@/pages/Landing';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { RegisterTenantPage } from '@/pages/RegisterTenantPage';
import { SourcesPage } from '@/pages/SourcesPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/RequireAuth';
import { EnvironmentalProvider } from '@/contexts/EnvironmentalContext';
import { ConnectionHealthProvider } from '@/contexts/ConnectionHealthContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { CompareProvider } from '@/contexts/CompareContext';
import { SourceDetailPage } from '@/pages/SourceDetailPage';

// Lazy load app pages for better performance and route-based chunking
const MapPage = lazy(() => import('@/pages/app/MapPage').then(m => ({ default: m.MapPage })));
const ProjectsPage = lazy(() => import('@/pages/app/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const SavedMapsPage = lazy(() => import('@/pages/app/SavedMapsPage').then(m => ({ default: m.SavedMapsPage })));
const BookmarksPage = lazy(() => import('@/pages/app/BookmarksPage').then(m => ({ default: m.BookmarksPage })));
const WatchlistsPage = lazy(() => import('@/pages/app/WatchlistsPage').then(m => ({ default: m.WatchlistsPage })));
const DrawingsPage = lazy(() => import('@/pages/app/DrawingsPage').then(m => ({ default: m.DrawingsPage })));
const AnnotationsPage = lazy(() => import('@/pages/app/AnnotationsPage').then(m => ({ default: m.AnnotationsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/app/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const ParcelDetailPage = lazy(() => import('@/pages/app/ParcelDetailPage').then(m => ({ default: m.ParcelDetailPage })));
const AreaIndexPage = lazy(() => import('@/pages/app/AreaIndexPage').then(m => ({ default: m.AreaIndexPage })));
const AreaDetailPage = lazy(() => import('@/pages/app/AreaDetailPage').then(m => ({ default: m.AreaDetailPage })));
const ComparePage = lazy(() => import('@/pages/app/ComparePage').then(m => ({ default: m.ComparePage })));
const ProfilePage = lazy(() => import('@/pages/app/ProfilePage').then(m => ({ default: m.ProfilePage })));
const TenantUsersPage = lazy(() => import('@/pages/app/TenantUsersPage').then(m => ({ default: m.TenantUsersPage })));
const TenantAddUserPage = lazy(() => import('@/pages/app/TenantAddUserPage').then(m => ({ default: m.TenantAddUserPage })));
const TenantUserRolePage = lazy(() => import('@/pages/app/TenantUserRolePage').then(m => ({ default: m.TenantUserRolePage })));
const TenantRolesPage = lazy(() => import('@/pages/app/TenantRolesPage').then(m => ({ default: m.TenantRolesPage })));
const TenantRoleEditPage = lazy(() => import('@/pages/app/TenantRoleEditPage').then(m => ({ default: m.TenantRoleEditPage })));
const TenantPermissionsPage = lazy(() => import('@/pages/app/TenantPermissionsPage').then(m => ({ default: m.TenantPermissionsPage })));
const TenantSettingsPage = lazy(() => import('@/pages/app/TenantSettingsPage').then(m => ({ default: m.TenantSettingsPage })));
const DataStatusDashboard = lazy(() => import('@/pages/app/DataStatusDashboard').then(m => ({ default: m.DataStatusDashboard })));
const TasksPage = lazy(() => import('@/pages/app/TasksPage').then(m => ({ default: m.TasksPage })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full bg-surface-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
      <p className="text-xs text-surface-500">Loading module...</p>
    </div>
  </div>
);

export default function App() {
  useEffect(() => {
    const el = document.getElementById('debug-initial-load');
    if (el) el.remove();
  }, []);
  
  return (
      <AuthProvider>
        <ConnectionHealthProvider>
        <CompareProvider>
          <EnvironmentalProvider>
          <ImpersonationProvider>
            <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/sign-in" element={<SignInPage />} />
                  <Route path="/sign-up" element={<SignUpPage />} />
                  <Route path="/register-tenant" element={<RegisterTenantPage />} />
                  <Route path="/sources" element={<SourcesPage />} />
                  <Route path="/sources/:sourceId" element={<SourceDetailPage />} />
                </Route>

                {/* App Routes - Map is public, others are protected */}
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to="map" replace />} />
                  <Route path="map" element={<MapPage />} />
                  
                  <Route path="projects" element={<RequireAuth><ProjectsPage /></RequireAuth>} />
                  <Route path="projects/:projectId" element={<RequireAuth><ProjectDetailPage /></RequireAuth>} />
                  <Route path="tasks" element={<RequireAuth><TasksPage /></RequireAuth>} />
                  <Route path="team" element={<RequireAuth><TenantUsersPage /></RequireAuth>} />
                  <Route path="team/invite" element={<RequireAuth><TenantAddUserPage /></RequireAuth>} />
                  <Route path="team/:uid/edit" element={<RequireAuth><TenantUserRolePage /></RequireAuth>} />
                  <Route path="roles" element={<RequireAuth><TenantRolesPage /></RequireAuth>} />
                  <Route path="roles/new" element={<RequireAuth><TenantRoleEditPage /></RequireAuth>} />
                  <Route path="roles/:roleId/edit" element={<RequireAuth><TenantRoleEditPage /></RequireAuth>} />
                  <Route path="permissions" element={<RequireAuth><TenantPermissionsPage /></RequireAuth>} />
                  <Route path="settings" element={<RequireAuth><TenantSettingsPage /></RequireAuth>} />
                  <Route path="drawings" element={<RequireAuth><DrawingsPage /></RequireAuth>} />
                  <Route path="annotations" element={<RequireAuth><AnnotationsPage /></RequireAuth>} />
                  <Route path="bookmarks" element={<RequireAuth><BookmarksPage /></RequireAuth>} />
                  <Route path="watchlists" element={<RequireAuth><WatchlistsPage /></RequireAuth>} />
                  <Route path="saved-maps" element={<RequireAuth><SavedMapsPage /></RequireAuth>} />
                  <Route path="parcel/:parcelId" element={<ParcelDetailPage />} />
                  <Route path="areas" element={<AreaIndexPage />} />
                  <Route path="areas/:areaId" element={<AreaDetailPage />} />
                  <Route path="compare" element={<ComparePage />} />
                  <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                  <Route path="data-status" element={<DataStatusDashboard />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </ImpersonationProvider>
          </EnvironmentalProvider>
        </CompareProvider>
        </ConnectionHealthProvider>
      </AuthProvider>
  );
}

