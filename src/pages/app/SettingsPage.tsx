import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/Card';

export const SettingsPage = () => {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Settings</h1>
        <p className="text-surface-500">Manage map defaults and application preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Map Preferences</CardTitle>
          <CardDescription>Set defaults for new map workspaces.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              <div className="p-3 border border-surface-200 rounded-md bg-surface-50 flex items-center justify-between opacity-50 cursor-not-allowed">
                 <span className="text-sm font-medium">Default Basemap</span>
                 <span className="text-sm text-surface-500">Light (Street)</span>
              </div>
               <div className="p-3 border border-surface-200 rounded-md bg-surface-50 flex items-center justify-between opacity-50 cursor-not-allowed">
                 <span className="text-sm font-medium">Theme</span>
                 <span className="text-sm text-surface-500">System</span>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};
