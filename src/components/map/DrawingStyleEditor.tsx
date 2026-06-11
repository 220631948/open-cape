import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DrawingStyle } from '@/hooks/useDrawings';
import { useProjects } from '@/hooks/useProjects';
import { useStorage } from '@/hooks/useStorage';
import { X, Palette, Building2, Image as ImageIcon, Plus, Upload, Loader2 } from 'lucide-react';

interface DrawingStyleEditorProps {
  style: DrawingStyle;
  title: string;
  projectId: string | null;
  imageUrl: string | null;
  onStyleChange: (style: DrawingStyle) => void;
  onTitleChange: (title: string) => void;
  onProjectChange: (projectId: string | null) => void;
  onImageUrlChange: (url: string | null) => void;
  onClose: () => void;
  onSave: () => void;
}

export const DrawingStyleEditor: React.FC<DrawingStyleEditorProps> = ({
  style,
  title,
  projectId,
  imageUrl,
  onStyleChange,
  onTitleChange,
  onProjectChange,
  onImageUrlChange,
  onClose,
  onSave
}) => {
  const { projects, createProject } = useProjects();
  const { uploadImage, isUploading: isUploadingImage } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localStroke, setLocalStroke] = React.useState(style.stroke);
  const [localFill, setLocalFill] = React.useState(style.fill);
  const [newProjectTitle, setNewProjectTitle] = React.useState('');
  const [isCreatingProject, setIsCreatingProject] = React.useState(false);

  React.useEffect(() => {
    setLocalStroke(style.stroke);
  }, [style.stroke]);

  React.useEffect(() => {
    setLocalFill(style.fill);
  }, [style.fill]);

  const handleChange = (field: keyof DrawingStyle, value: any) => {
    onStyleChange({ ...style, [field]: value });
  };

  const handleStrokeInput = (val: string) => {
    let formatted = val;
    if (!formatted.startsWith('#') && formatted.length > 0) {
      formatted = '#' + formatted;
    }
    setLocalStroke(formatted);
    if (/^#[0-9A-Fa-f]{6}$/i.test(formatted)) {
      handleChange('stroke', formatted);
    }
  };

  const handleFillInput = (val: string) => {
    let formatted = val;
    if (!formatted.startsWith('#') && formatted.length > 0) {
      formatted = '#' + formatted;
    }
    setLocalFill(formatted);
    if (/^#[0-9A-Fa-f]{6}$/i.test(formatted)) {
      handleChange('fill', formatted);
    }
  };

  const handleProjectSelect = async (val: string) => {
    if (val === 'new') {
      onProjectChange('new');
    } else {
      onProjectChange(val || null);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;
    setIsCreatingProject(true);
    try {
      const newId = await createProject(newProjectTitle);
      onProjectChange(newId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingProject(false);
      setNewProjectTitle('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file, 'drawings');
    if (url) {
      onImageUrlChange(url);
    }
  };

  return (
    <Card className="w-80 shadow-2xl border-none bg-white rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 bg-surface-50">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-surface-900">
          <Palette className="h-4 w-4 text-indigo-500" />
          Drawing Properties
        </CardTitle>
        <button onClick={onClose} aria-label="Close editor" className="p-1.5 hover:bg-surface-200 rounded-lg text-surface-400 hover:text-surface-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-400 ml-1">Title</label>
          <Input 
            value={title} 
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-10 text-sm bg-surface-50 border-surface-100 rounded-lg"
            placeholder="Drawing name..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-400 ml-1 flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Project Association
          </label>
          <div className="space-y-2">
            <select
              value={projectId || ''}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full h-10 px-3 bg-surface-50 border border-surface-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none font-medium"
            >
              <option value="">No Project</option>
              <option value="new">+ Create New Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            {projectId === 'new' && (
              <div className="flex gap-2 group">
                <Input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="New Title"
                  className="h-9 text-xs bg-surface-50 border-indigo-100 flex-1"
                />
                <Button 
                  onClick={handleCreateProject}
                  disabled={isCreatingProject || !newProjectTitle.trim()}
                  className="h-9 w-9 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-400 ml-1 flex items-center gap-1">
            <ImageIcon className="h-3 w-3" /> Image Annotation
          </label>
          <div className="flex gap-2">
            <Input 
              value={imageUrl || ''} 
              onChange={(e) => onImageUrlChange(e.target.value || null)}
              className="h-10 text-[10px] bg-surface-50 border-surface-100 rounded-lg flex-1"
              placeholder="URL or Upload..."
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 p-0 flex items-center justify-center rounded-lg border-surface-200"
            >
              {isUploadingImage ? (
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-surface-400" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Stroke</label>
            <div className="flex gap-2">
               <input 
                 type="color" 
                 value={style.stroke} 
                 onChange={(e) => handleChange('stroke', e.target.value)}
                 className="h-9 w-9 shrink-0 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
               />
               <Input 
                 value={localStroke}
                 onChange={(e) => handleStrokeInput(e.target.value)}
                 className="h-9 text-[10px] font-mono px-2 bg-surface-50"
                 maxLength={7}
               />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Width</label>
            <Input 
              type="number"
              min="1" 
              max="15"
              value={style.strokeWidth} 
              onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
              className="h-9 text-xs bg-surface-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Fill</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={style.fill} 
                onChange={(e) => handleChange('fill', e.target.value)}
                className="h-9 w-9 shrink-0 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
              />
               <Input 
                 value={localFill}
                 onChange={(e) => handleFillInput(e.target.value)}
                 className="h-9 text-[10px] font-mono px-2 bg-surface-50"
                 maxLength={7}
               />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Opacity</label>
            <Input 
              type="number" 
              step="0.1"
              min="0"
              max="1"
              value={style.fillOpacity} 
              onChange={(e) => handleChange('fillOpacity', parseFloat(e.target.value))}
              className="h-9 text-xs bg-surface-50"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-surface-50">
          <Button 
            variant="ghost" 
            onClick={() => onStyleChange({
              stroke: '#3b82f6',
              fill: '#3b82f6',
              fillOpacity: 0.2,
              strokeWidth: 2
            })} 
            className="flex-1 h-11 text-xs font-bold text-surface-500 hover:bg-surface-50 rounded-xl"
          >
            Reset
          </Button>
          <Button onClick={onSave} className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
