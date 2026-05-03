import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Textarea } from '@/src/components/ui/Textarea';
import { X, MessageSquare, Building2, ShieldAlert } from 'lucide-react';
import { useProjects } from '@/src/hooks/useProjects';

interface AnnotationEditorProps {
  targetType: 'drawing' | 'map' | 'saved-map' | 'placeholder-feature' | 'parcel';
  targetId: string;
  initialTitle?: string;
  initialBody?: string;
  projectId?: string | null;
  sourceRefs?: string[];
  onSave: (data: { title: string, body: string, projectId: string | null, sourceRefs: string[] }) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  targetType,
  initialTitle = '',
  initialBody = '',
  projectId: initialProjectId,
  sourceRefs = [],
  onSave,
  onClose,
  isSaving = false
}) => {
  const { projects } = useProjects();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [projectId, setProjectId] = useState(initialProjectId || '');

  const handleSave = () => {
    onSave({ title, body, projectId: projectId || null, sourceRefs });
  };

  return (
    <Card className="w-80 shadow-2xl border-surface-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-surface-100 bg-surface-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-rose-500" />
          <CardTitle className="text-sm font-semibold">
            {initialTitle ? 'Edit Annotation' : 'New Annotation'}
          </CardTitle>
        </div>
        <button onClick={onClose} className="text-surface-400 hover:text-surface-900 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-1">
          <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
            Target: {targetType.replace('-', ' ')}
          </CardDescription>
          {sourceRefs.length === 0 && (
             <div className="flex items-center gap-1.5 py-1 px-2 bg-amber-50 rounded border border-amber-100 text-[10px] text-amber-700 font-medium">
                <ShieldAlert className="h-3 w-3" />
                No verified source connected
             </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-700">Subject</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm"
              placeholder="Observation, query, or note..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-700">Details</label>
            <Textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[100px] text-sm resize-none"
              placeholder="Enter your private planning notes..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-700 flex items-center gap-1">
              <Building2 className="h-2.5 w-2.5" /> Link Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-surface-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-surface-400"
            >
              <option value="">None</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !title.trim()}
            className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            {isSaving ? 'Saving...' : (initialTitle ? 'Update Annotation' : 'Save Annotation')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
