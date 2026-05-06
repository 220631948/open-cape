import React, { useState, useEffect } from 'react';
import { useDrawings, Drawing, DrawingStyle } from '@/hooks/useDrawings';
import { useProjects } from '@/hooks/useProjects';
import { EditDrawingDialog } from '@/components/drawings/EditDrawingDialog';
import { SortableDrawingCard } from '@/components/drawings/SortableDrawingCard';
import { EmptyState, Skeleton, Button } from '@/components/ui';
import { Pencil, Search, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

export const DrawingsPage = () => {
  const navigate = useNavigate();
  const { drawings, isLoading, updateDrawing, deleteDrawing, reorderDrawings } = useDrawings();
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingDrawing, setEditingDrawing] = useState<Drawing | null>(null);
  
  // Local state for optimistic UI updates during drag
  const [localDrawings, setLocalDrawings] = useState<Drawing[]>([]);

  useEffect(() => {
    setLocalDrawings(drawings);
  }, [drawings]);

  const filteredDrawings = localDrawings.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.geometryType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectName = (projectId?: string) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId)?.title;
  };

  const handleViewOnMap = (drawing: Drawing) => {
    navigate('/app/map', { state: { focusDrawing: drawing } });
  };

  const handleEditDrawingSave = async (id: string, title: string, style: DrawingStyle, projectId: string | null, imageUrl: string | null) => {
    await updateDrawing(id, { title, style, projectId, imageUrl });
    setEditingDrawing(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLocalDrawings((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        reorderDrawings(newItems.map(item => item.id));
        return newItems;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end">
           <Skeleton className="h-10 w-48" />
           <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 mb-1 flex items-center gap-2">
            <Pencil className="h-6 w-6 text-surface-400" />
            My Drawings
          </h1>
          <p className="text-surface-500">Manage your custom spatial shapes, boundaries, and annotations.</p>
        </div>
        <Button onClick={() => navigate('/app/map')} className="bg-surface-900 border-surface-900 text-white hover:bg-surface-800 h-10 px-6 font-semibold">
           <MapIcon className="h-4 w-4 mr-2" /> Open Map Workspace
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm relative mb-8">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input 
           type="text" 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           placeholder="Search drawings by title or type..."
           className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-surface-400 transition-all"
        />
      </div>

      {drawings.length === 0 ? (
        <EmptyState
          icon={Pencil}
          title="No drawings yet"
          description="Create a point, line, or polygon in the map workspace to save your first drawing."
          action={{
            label: "Go to Map",
            onClick: () => navigate('/app/map')
          }}
        />
      ) : filteredDrawings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
           <div className="h-16 w-16 bg-surface-50 rounded-full flex items-center justify-center mb-4 border border-surface-100">
              <Search className="h-8 w-8 text-surface-300" />
           </div>
           <h3 className="text-lg font-semibold text-surface-900">No matching drawings</h3>
           <p className="text-surface-500 max-w-xs mt-1">Try refining your search terms or filters.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredDrawings.map((d) => d.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDrawings.map((drawing) => (
                <SortableDrawingCard 
                  key={drawing.id} 
                  drawing={drawing} 
                  onView={handleViewOnMap}
                  onEdit={setEditingDrawing}
                  onDelete={deleteDrawing}
                  projectName={getProjectName(drawing.projectId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <EditDrawingDialog 
         drawing={editingDrawing}
         isOpen={!!editingDrawing}
         onClose={() => setEditingDrawing(null)}
         onSave={handleEditDrawingSave}
      />
    </div>
  );
};
