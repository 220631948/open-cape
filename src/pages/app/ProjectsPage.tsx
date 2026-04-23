import React from 'react';
import { Button } from '@/src/components/ui/Button';
import { FolderKanban } from 'lucide-react';
import { EmptyState } from '@/src/components/ui/EmptyState';

export const ProjectsPage = () => {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">Projects</h1>
          <p className="text-surface-500">Manage your private planning and investment workspaces.</p>
        </div>
        <Button disabled>New Project</Button>
      </div>

      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create a project to save maps, assemble properties, and store analysis."
        actionLabel="Create Project"
        onAction={() => {}}
      />
    </div>
  );
};
