import React, { useState } from 'react';
import { Bookmark, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useProjects } from '@/hooks/useProjects';
import { DataStatusBanner } from '@/components/ui/DataStatusBanner';
import { useEnvironmentalContext } from '@/contexts/EnvironmentalContext';
import { ALL_SOURCES } from '@/sources';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // context info
  currentFeatureId?: string | null;
  mapState?: { zoom: number; lat: number; lng: number };
}

export const AddBookmarkDialog: React.FC<AddBookmarkDialogProps> = ({ isOpen, onClose, currentFeatureId, mapState }) => {
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const { createBookmark } = useBookmarks();
  const { projects } = useProjects();
  const { activeLayers } = useEnvironmentalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive source info if feature is selected
  const targetSource = currentFeatureId ? ALL_SOURCES.find(s => 
    String(currentFeatureId).startsWith(s.id) || (s.id === 'erf_boundaries' && String(currentFeatureId).startsWith('cct-'))
  ) : null;

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    try {
      await createBookmark({
        label: label.trim(),
        type: currentFeatureId ? 'feature' : 'map-state',
        projectId: projectId || undefined,
        notes: notes.trim() || undefined,
        sourceRefs: targetSource ? [targetSource.id] : [], 
        featureRef: currentFeatureId ? { id: currentFeatureId } : undefined,
        mapState, // Save viewport state if provided
      });
      onClose();
      // Reset form
      setLabel('');
      setNotes('');
      setProjectId('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 shrink-0">
          <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
             <Bookmark className="h-5 w-5 text-rose-500" />
             Save Bookmark
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-surface-400 hover:text-surface-900 -mr-2" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* Honest Messaging derived from source or environment */}
          {targetSource ? (
            <DataStatusBanner 
               sourceId={targetSource.id}
               className="mb-2"
            />
          ) : activeLayers.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-xs leading-relaxed font-medium">
               Environmental context active. Dynamic layer states will be preserved in this bookmark.
            </div>
          ) : (
            <DataStatusBanner 
               variant="info" 
               title="Map State Bookmark"
               description="Saving the current viewport and active layers. Does not link to a specific cadastral record."
            />
          )}

          {currentFeatureId && (
             <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs leading-relaxed flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 px-0" />
                <span>Linking to {targetSource?.label || "feature"} <strong>{currentFeatureId}</strong>.</span>
             </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900">Bookmark Label <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Interesting parcel, Central business district..."
              className="w-full px-3 py-2 border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 bg-surface-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your analysis or context..."
              rows={3}
              className="w-full px-3 py-2 border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 bg-surface-50 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900">Add to Project (Optional)</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 bg-surface-50"
            >
              <option value="">-- No Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={!label.trim() || isSubmitting} className="bg-surface-900 text-white hover:bg-surface-800">
               {isSubmitting ? 'Saving...' : 'Save Bookmark'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
