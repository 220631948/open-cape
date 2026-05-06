import React, { useState } from 'react';
import { useAnnotations, Annotation } from '@/hooks/useAnnotations';
import { useProjects } from '@/hooks/useProjects';
import { AnnotationCard } from '@/components/annotations/AnnotationCard';
import { AnnotationEditor } from '@/components/annotations/AnnotationEditor';
import { EmptyState, Skeleton, Button } from '@/components/ui';
import { MessageSquare, Search, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

export const AnnotationsPage = () => {
  const navigate = useNavigate();
  const { annotations, isLoading, deleteAnnotation, updateAnnotation } = useAnnotations();
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);

  const filteredAnnotations = annotations.filter(a => {
    const projName = getProjectName(a.projectId)?.toLowerCase() || '';
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.targetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projName.includes(searchQuery.toLowerCase());
    
    if (filterType !== 'all' && a.targetType !== filterType) return false;
    
    return matchesSearch;
  });

  const getProjectName = (projectId?: string) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId)?.title;
  };

  const handleUpdate = async (data: any) => {
    if (!editingAnnotation) return;
    await updateAnnotation(editingAnnotation.id, data);
    setEditingAnnotation(null);
  };

  const handleView = (annotation: Annotation) => {
    navigate('/app/map', { state: { focusAnnotation: annotation } });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end">
           <Skeleton className="h-10 w-48" />
           <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col min-h-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 mb-1 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-surface-400" />
            My Annotations
          </h1>
          <p className="text-surface-500">Private planning notes and observations linked to your workspace.</p>
        </div>
        <Button onClick={() => navigate('/app/map')} className="bg-surface-900 border-surface-900 text-white hover:bg-surface-800 h-10 px-6 font-semibold">
           <MapIcon className="h-4 w-4 mr-2" /> Open Map Workspace
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search notes by subject, content, or project..."
             className="w-full pl-10 pr-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-surface-400 shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-surface-100 rounded-xl border border-surface-200 overflow-x-auto max-w-full scrollbar-none">
          {['all', 'drawing', 'map', 'saved-map'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterType === type 
                  ? "bg-white text-surface-900 shadow-sm ring-1 ring-surface-200" 
                  : "text-surface-500 hover:text-surface-700"
              )}
            >
              {type.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {annotations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No annotations yet"
          description="Add notes to drawings, saved maps, or your current workspace to track your analysis."
          action={{
            label: "Explore Map",
            onClick: () => navigate('/app/map')
          }}
        />
      ) : filteredAnnotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
           <div className="h-16 w-16 bg-surface-50 rounded-full flex items-center justify-center mb-4 border border-surface-100">
              <Search className="h-8 w-8 text-surface-300" />
           </div>
           <h3 className="text-lg font-semibold text-surface-900">No matching notes</h3>
           <p className="text-surface-500 max-w-xs mt-1">Try refining your search terms or clearing filters.</p>
           <Button variant="link" onClick={() => { setSearchQuery(''); setFilterType('all'); }} className="mt-2 text-surface-900 font-bold uppercase tracking-widest text-[10px]">
              Clear all filters
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnotations.map((annotation) => (
            <AnnotationCard 
              key={annotation.id} 
              annotation={annotation} 
              onEdit={setEditingAnnotation}
              onDelete={deleteAnnotation}
              onView={handleView}
              projectName={getProjectName(annotation.projectId)}
            />
          ))}
        </div>
      )}

      {editingAnnotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <AnnotationEditor 
             targetType={editingAnnotation.targetType}
             targetId={editingAnnotation.targetId}
             initialTitle={editingAnnotation.title}
             initialBody={editingAnnotation.body}
             initialImageUrl={editingAnnotation.imageUrl}
             projectId={editingAnnotation.projectId}
             sourceRefs={editingAnnotation.sourceRefs}
             initialGeometry={editingAnnotation.geometry}
             onSave={handleUpdate}
             onClose={() => setEditingAnnotation(null)}
           />
        </div>
      )}
    </div>
  );
};
