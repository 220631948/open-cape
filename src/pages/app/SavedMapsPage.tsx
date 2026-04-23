import React from 'react';
import { Bookmark } from 'lucide-react';
import { EmptyState } from '@/src/components/ui/EmptyState';

export const SavedMapsPage = () => {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">Saved Maps</h1>
          <p className="text-surface-500">Your private map views, layers, and filters.</p>
        </div>
      </div>

      <EmptyState
        icon={Bookmark}
        title="No saved maps"
        description="Explore the map and save specific views, layer configurations, and context to return to later."
      />
    </div>
  );
};
