import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DrawingStyle, Drawing } from '@/hooks/useDrawings';
import { Palette, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useStorage } from '@/hooks/useStorage';
import { motion } from 'motion/react';

interface EditDrawingDialogProps {
  drawing: Drawing | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, title: string, style: DrawingStyle, projectId: string | null, imageUrl: string | null) => void;
}

export const EditDrawingDialog: React.FC<EditDrawingDialogProps> = ({
  drawing,
  isOpen,
  onClose,
  onSave
}) => {
  const { projects, createProject } = useProjects();
  const { uploadImage, isUploading: isUploadingImage } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [style, setStyle] = useState<DrawingStyle>({
    stroke: '#E11D48',
    strokeWidth: 2,
    fill: '#E11D48',
    fillOpacity: 0.1
  });

  useEffect(() => {
    if (drawing) {
      setTitle(drawing.title || '');
      setImageUrl(drawing.imageUrl || '');
      setProjectId(drawing.projectId || null);
      setStyle(drawing.style || {
        stroke: '#E11D48',
        strokeWidth: 2,
        fill: '#E11D48',
        fillOpacity: 0.1
      });
    }
  }, [drawing]);

  const handleChange = (field: keyof DrawingStyle, value: any) => {
    setStyle(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file, 'drawings');
    if (url) {
      setImageUrl(url);
    }
  };

  const handleSave = async () => {
    if (drawing) {
      let finalProjectId = projectId;
      if (projectId === 'new' && newProjectTitle.trim()) {
        setIsCreatingProject(true);
        try {
          finalProjectId = await createProject(newProjectTitle);
        } catch (err) {
          console.error("Failed to create project:", err);
        } finally {
          setIsCreatingProject(false);
        }
      }
      onSave(drawing.id, title, style, finalProjectId, imageUrl || null);
    }
  };

  if (!drawing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-surface-900">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-indigo-600" />
              </div>
              Edit Drawing
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 ml-1">Drawing Title</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 text-sm bg-surface-50 border-surface-100 rounded-xl"
                placeholder="Give your drawing a name..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 ml-1">Associate with Project</label>
              <div className="space-y-3">
                <select 
                  value={projectId || ''} 
                  onChange={(e) => setProjectId(e.target.value || null)}
                  className="w-full h-12 px-4 text-sm bg-surface-50 border border-surface-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium appearance-none"
                >
                  <option value="">No Project (Loose Drawing)</option>
                  <option value="new">+ Create New Project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                {projectId === 'new' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="New Project Title"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="h-11 bg-surface-50 border-surface-200"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 ml-1">Image Annotation</label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Input 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-12 text-sm bg-surface-50 border-surface-100 rounded-xl pl-11"
                    placeholder="https://example.com/image.jpg"
                  />
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 transition-colors group-focus-within:text-indigo-600" />
                </div>
                
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
                  className="h-12 w-12 p-0 flex items-center justify-center rounded-xl border-surface-200"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-surface-400" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-surface-400 italic ml-1">Upload a photo or paste a URL for this site annotation.</p>
            </div>

            <div className="pt-4 border-t border-surface-50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Stroke</label>
                  <div className="flex gap-2">
                     <input 
                       type="color" 
                       value={style.stroke} 
                       onChange={(e) => handleChange('stroke', e.target.value)}
                       className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                     />
                     <Input 
                       value={style.stroke}
                       onChange={(e) => handleChange('stroke', e.target.value)}
                       className="h-10 text-[10px] font-mono bg-surface-50"
                     />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Stroke Width</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={style.strokeWidth} 
                    onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
                    className="h-10 text-sm bg-surface-50"
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
                      className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                    />
                     <Input 
                       value={style.fill}
                       onChange={(e) => handleChange('fill', e.target.value)}
                       className="h-10 text-[10px] font-mono bg-surface-50"
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
                    className="h-10 text-sm bg-surface-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-surface-50 flex justify-end gap-3 rounded-b-[2rem]">
          <Button variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl text-surface-500 font-bold hover:bg-surface-100">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isCreatingProject}
            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            {isCreatingProject ? 'Creating Project...' : 'Commit Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
