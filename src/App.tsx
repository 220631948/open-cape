/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { PublicLayout } from '@/src/layouts/PublicLayout';
import { AppLayout } from '@/src/layouts/AppLayout';
import { LandingPage } from '@/src/pages/LandingPage';
import { SignInPage } from '@/src/pages/SignInPage';
import { SourcesPage } from '@/src/pages/SourcesPage';
import { MapPage } from '@/src/pages/app/MapPage';
import { ProjectsPage } from '@/src/pages/app/ProjectsPage';
import { SavedMapsPage } from '@/src/pages/app/SavedMapsPage';
import { BookmarksPage } from '@/src/pages/app/BookmarksPage';
import { DrawingsPage } from '@/src/pages/app/DrawingsPage';
import { AnnotationsPage } from '@/src/pages/app/AnnotationsPage';
import { ProjectDetailPage } from '@/src/pages/app/ProjectDetailPage';
import { ParcelDetailPage } from '@/src/pages/app/ParcelDetailPage';
import { AreaIndexPage } from '@/src/pages/app/AreaIndexPage';
import { AreaDetailPage } from '@/src/pages/app/AreaDetailPage';
import { ComparePage } from '@/src/pages/app/ComparePage';
import { ProfilePage } from '@/src/pages/app/ProfilePage';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { EnvironmentalProvider } from '@/src/contexts/EnvironmentalContext';
import { ConnectionHealthProvider } from '@/src/contexts/ConnectionHealthContext';

import { SourceDetailPage } from '@/src/pages/SourceDetailPage';

import { CompareProvider } from '@/src/contexts/CompareContext';

import { DataStatusDashboard } from '@/src/pages/app/DataStatusDashboard';

export default function App() {
  return (
    <AuthProvider>
      <ConnectionHealthProvider>
      <CompareProvider>
        <EnvironmentalProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/sources/:sourceId" element={<SourceDetailPage />} />
          </Route>

          {/* Protected App Routes */}
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="map" replace />} />
            <Route path="map" element={<MapPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="drawings" element={<DrawingsPage />} />
            <Route path="annotations" element={<AnnotationsPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="saved-maps" element={<SavedMapsPage />} />
            <Route path="parcel/:parcelId" element={<ParcelDetailPage />} />
            <Route path="areas" element={<AreaIndexPage />} />
            <Route path="areas/:areaId" element={<AreaDetailPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="data-status" element={<DataStatusDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
        </EnvironmentalProvider>
      </CompareProvider>
      </ConnectionHealthProvider>
    </AuthProvider>
  );
}
