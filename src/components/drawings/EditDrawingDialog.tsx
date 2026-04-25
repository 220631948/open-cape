import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { DrawingStyle, Drawing } from '@/src/hooks/useDrawings';
import { Palette } from 'lucide-react';

interface EditDrawingDialogProps {
  drawing: Drawing | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, title: string, style: DrawingStyle) => void;
}

export const EditDrawingDialog: React.FC<EditDrawingDialogProps> = ({
  drawing,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState<DrawingStyle>({
    stroke: '#E11D48',
    strokeWidth: 2,
    fill: '#E11D48',
    fillOpacity: 0.1
  });

  useEffect(() => {
    if (drawing) {
      setTitle(drawing.title || '');
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

  const handleSave = () => {
    if (drawing) {
      onSave(drawing.id, title, style);
    }
  };

  if (!drawing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-surface-400" />
            Edit Drawing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm"
              placeholder="Drawing name..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Stroke Color</label>
              <div className="flex gap-2">
                 <input 
                   type="color" 
                   value={style.stroke} 
                   onChange={(e) => handleChange('stroke', e.target.value)}
                   className="h-10 w-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
                 />
                 <Input 
                   value={style.stroke}
                   onChange={(e) => handleChange('stroke', e.target.value)}
                   className="h-10 text-xs font-mono"
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
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Fill Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={style.fill} 
                  onChange={(e) => handleChange('fill', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
                />
                 <Input 
                   value={style.fill}
                   onChange={(e) => handleChange('fill', e.target.value)}
                   className="h-10 text-xs font-mono"
                 />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Fill Opacity</label>
              <Input 
                type="number" 
                step="0.1"
                min="0"
                max="1"
                value={style.fillOpacity} 
                onChange={(e) => handleChange('fillOpacity', parseFloat(e.target.value))}
                className="h-10 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
          <Button variant="outline" onClick={onClose} className="h-10">Cancel</Button>
          <Button onClick={handleSave} className="h-10 bg-surface-900 hover:bg-surface-800 text-white px-6">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
