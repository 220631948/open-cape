import React, { useState } from 'react';
import { Plus, FolderKanban, Search, Bookmark, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useProjects } from '@/src/hooks/useProjects';
import { Link, useNavigate } from 'react-router';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { ErrorState } from '@/src/components/ui/ErrorState';

export const ProjectsPage = () => {
   const { projects, isLoading, error, createProject, deleteProject } = useProjects();
   const [searchQuery, setSearchQuery] = useState('');
   const [isCreating, setIsCreating] = useState(false);
   const [newTitle, setNewTitle] = useState('');
   const navigate = useNavigate();

   const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

   const handleCreate = async () => {
      if (!newTitle.trim()) return;
      setIsCreating(true);
      try {
         const id = await createProject(newTitle.trim());
         setNewTitle('');
         navigate(`/app/projects/${id}`);
      } catch (err: any) {
         console.error(err);
      } finally {
         setIsCreating(false);
      }
   };

   if (error) {
      return (
         <div className="p-8 max-w-4xl mx-auto flex justify-center">
            <ErrorState title="Failed to load projects" description={error} />
         </div>
      );
   }

   return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 h-full overflow-y-auto">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-2xl font-semibold text-surface-900 tracking-tight">Saved Projects</h1>
               <p className="text-surface-500 text-sm mt-1">Organize your saved maps, bookmarks, and property analysis.</p>
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
            <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter projects..."
                  className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-surface-400"
               />
            </div>
            <div className="h-8 w-px bg-surface-200 hidden md:block" />
            <div className="flex gap-2 w-full md:w-auto">
               <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="New project name"
                  className="w-full md:w-48 px-3 py-2 bg-surface-50 border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-surface-400"
               />
               <Button onClick={handleCreate} disabled={!newTitle.trim() || isCreating} className="shrink-0 bg-surface-900 text-white hover:bg-surface-800">
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Create'}
               </Button>
            </div>
         </div>

         {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 h-48 flex flex-col">
                     <Skeleton className="h-6 w-3/4 mb-4" />
                     <Skeleton className="h-4 w-full mb-2" />
                     <Skeleton className="h-4 w-2/3" />
                  </div>
               ))}
            </div>
         ) : filteredProjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-surface-300">
               <div className="h-16 w-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
                  <FolderKanban className="h-8 w-8 text-surface-400" />
               </div>
               <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {searchQuery ? 'No projects match your filter' : 'No projects yet'}
               </h3>
               <p className="text-surface-500 text-balance max-w-sm">
                  {searchQuery ? '' : 'Create a project to organize saved maps and bookmarks.'}
               </p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredProjects.map((project) => (
                  <Link key={project.id} to={`/app/projects/${project.id}`} className="group bg-white rounded-xl border border-surface-200 shadow-sm p-6 hover:shadow-md transition-shadow relative flex flex-col h-full">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <FolderKanban className="h-5 w-5 text-surface-400" />
                           <h3 className="font-semibold text-surface-900 group-hover:text-rose-600 transition-colors line-clamp-1">{project.title}</h3>
                        </div>
                     </div>
                     <p className="text-sm text-surface-500 line-clamp-2 mb-4 flex-1">
                        {project.description || 'No description.'}
                     </p>
                     
                     {/* Data freshness/source indicator */}
                     {project.sourceRefs && project.sourceRefs.length > 0 ? (
                        <div className="mb-4 inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                           <ShieldCheck className="h-3 w-3" />
                           {project.sourceRefs.length} Verified Sources
                        </div>
                     ) : (
                        <div className="mb-4 inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                           <ShieldCheck className="h-3 w-3 opacity-50" />
                           No Sources Attached
                        </div>
                     )}

                     <div className="flex items-center justify-between text-xs font-medium border-t border-surface-100 pt-4 mt-auto">
                        <div className="flex gap-4 text-surface-500">
                           <span className="flex items-center gap-1.5" title="Linked Maps">
                              <MapPin className="h-3.5 w-3.5" />
                              {project.linkedSavedMapIds?.length || 0}
                           </span>
                           <span className="flex items-center gap-1.5" title="Bookmarks">
                              <Bookmark className="h-3.5 w-3.5" />
                              {/* Wait, bookmark logic needs to count them, we'll keep it 0 here until fetched or store counter */}
                              <span className="opacity-50">#</span>
                           </span>
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-surface-400 bg-surface-100 px-2 py-0.5 rounded">
                           {project.privacy}
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         )}
      </div>
   );
};
