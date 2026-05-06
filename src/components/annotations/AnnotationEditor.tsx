import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { X, MessageSquare, Building2, ShieldAlert } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

interface AnnotationEditorProps {
  targetType: 'drawing' | 'map' | 'saved-map' | 'placeholder-feature' | 'parcel';
  targetId: string;
  initialTitle?: string;
  initialBody?: string;
  initialImageUrl?: string | null;
  initialStyle?: {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
  } | null;
  initialGeometry?: any | null;
  projectId: string | null;
  sourceRefs?: string[];
  onSave: (data: { 
    title: string, 
    body: string, 
    imageUrl: string | null, 
    projectId: string | null, 
    sourceRefs: string[],
    style: {
      stroke?: string;
      strokeWidth?: number;
      fill?: string;
      fillOpacity?: number;
    } | null
  }) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  targetType,
  targetId,
  initialTitle = '',
  initialBody = '',
  initialImageUrl = null,
  initialStyle = null,
  initialGeometry = null,
  projectId: initialProjectId,
  sourceRefs = [],
  onSave,
  onClose,
  isSaving = false
}) => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [style, setStyle] = useState(initialStyle || {
    stroke: '#e11d48', // rose-600
    strokeWidth: 2,
    fill: '#fb7185', // rose-400
    fillOpacity: 0.1
  });

  const handleSave = () => {
    onSave({ 
      title, 
      body, 
      imageUrl: imageUrl || null, 
      projectId: projectId || null, 
      sourceRefs,
      style 
    });
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
              Image URL (Optional)
            </label>
            <Input 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-8 text-sm"
              placeholder="https://..."
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

          <div className="space-y-2 pt-2 border-t border-surface-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-700">Display Style</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-surface-500 font-bold uppercase">Stroke</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={style.stroke} 
                    onChange={(e) => setStyle({...style, stroke: e.target.value})}
                    className="w-6 h-6 rounded border-none p-0 bg-transparent cursor-pointer"
                  />
                  <Input 
                    type="number" 
                    value={style.strokeWidth} 
                    onChange={(e) => setStyle({...style, strokeWidth: parseInt(e.target.value)})}
                    className="h-6 w-10 text-[10px] px-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-surface-500 font-bold uppercase">Fill</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={style.fill} 
                    onChange={(e) => setStyle({...style, fill: e.target.value})}
                    className="w-6 h-6 rounded border-none p-0 bg-transparent cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5">
                    <Input 
                      type="number" 
                      min="0" max="1" step="0.1"
                      value={style.fillOpacity} 
                      onChange={(e) => setStyle({...style, fillOpacity: parseFloat(e.target.value)})}
                      className="h-6 w-12 text-[10px] px-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          {initialGeometry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-[10px] font-bold uppercase border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => {
                if (window.location.pathname !== '/app/map') {
                  navigate('/app/map', { 
                    state: { 
                      focusGeometry: initialGeometry,
                      focusParcelId: targetType === 'parcel' ? initialTitle : null
                    } 
                  });
                } else {
                  window.dispatchEvent(new CustomEvent('map:center-on-feature', { 
                    detail: { 
                      geometry: initialGeometry,
                      parcelId: targetType === 'parcel' ? initialTitle : null 
                    } 
                  }));
                }
              }}
            >
              View on Map
            </Button>
          )}
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
