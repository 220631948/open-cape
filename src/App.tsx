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
import { ProfilePage } from '@/src/pages/app/ProfilePage';
import { SettingsPage } from '@/src/pages/app/SettingsPage';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { AuthGate } from '@/src/components/AuthGate';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sources" element={<SourcesPage />} />
          </Route>

          {/* Protected App Routes */}
          <Route path="/app" element={<AuthGate><AppLayout /></AuthGate>}>
            <Route index element={<Navigate to="map" replace />} />
            <Route path="map" element={<MapPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="saved-maps" element={<SavedMapsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
