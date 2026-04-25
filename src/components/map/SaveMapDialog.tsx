import React, { useState } from 'react';
import { X, LayoutDashboard } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useSavedMaps } from '@/src/hooks/useSavedMaps';
import { useProjects } from '@/src/hooks/useProjects';

interface SaveMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  viewport: any;
  visibleLayers: string[];
}

export const SaveMapDialog: React.FC<SaveMapDialogProps> = ({ isOpen, onClose, viewport, visibleLayers }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { createSavedMap } = useSavedMaps();
  const { projects } = useProjects();

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await createSavedMap({
        title,
        description,
        projectId: projectId || undefined,
        viewport,
        visibleLayers,
        activeFilters: {}
      });
      setTitle('');
      setDescription('');
      setProjectId('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save map view.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-surface-400" /> Save Map View
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mr-2">
             <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700">Map Title <span className="text-rose-500">*</span></label>
            <input 
               type="text" 
               className="w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
               placeholder="e.g. CBD Focus Area Analysis"
               value={title}
               onChange={e => setTitle(e.target.value)}
               autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700">Description</label>
            <textarea 
               className="w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
               rows={3}
               placeholder="What are you looking at? (Optional)"
               value={description}
               onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-surface-700">Link to Project</label>
            <select
               className="w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm bg-white"
               value={projectId}
               onChange={e => setProjectId(e.target.value)}
            >
               <option value="">-- No Project --</option>
               {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
               ))}
            </select>
          </div>
          
          <div className="bg-surface-50 border border-surface-200 rounded-md p-3 text-xs text-surface-600 space-y-1">
             <p>This will save:</p>
             <ul className="list-disc pl-4 space-y-0.5 text-surface-500">
               <li>Current map coordinates and zoom: Z{Math.round(viewport.zoom)}</li>
               <li>{visibleLayers.length === 0 ? 'No active layers' : `${visibleLayers.length} active layers`}</li>
               <li>Active town planning filters</li>
             </ul>
          </div>
        </div>

        <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 flex justify-end gap-3 rounded-b-xl">
           <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
           <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? 'Saving...' : 'Save Map View'}
           </Button>
        </div>
      </div>
    </div>
  );
};
