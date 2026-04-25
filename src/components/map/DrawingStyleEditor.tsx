import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { DrawingStyle } from '@/src/hooks/useDrawings';
import { X, Palette } from 'lucide-react';

interface DrawingStyleEditorProps {
  style: DrawingStyle;
  title: string;
  onStyleChange: (style: DrawingStyle) => void;
  onTitleChange: (title: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const DrawingStyleEditor: React.FC<DrawingStyleEditorProps> = ({
  style,
  title,
  onStyleChange,
  onTitleChange,
  onClose,
  onSave
}) => {
  const [localStroke, setLocalStroke] = React.useState(style.stroke);
  const [localFill, setLocalFill] = React.useState(style.fill);

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

  return (
    <Card className="w-72 shadow-xl border-surface-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-surface-100">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4 text-surface-400" />
          Drawing Properties
        </CardTitle>
        <button onClick={onClose} className="text-surface-400 hover:text-surface-900 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Title</label>
          <Input 
            value={title} 
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-8 text-sm"
            placeholder="Drawing name..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Stroke</label>
            <div className="flex gap-2">
               <input 
                 type="color" 
                 value={style.stroke} 
                 onChange={(e) => handleChange('stroke', e.target.value)}
                 className="h-8 w-8 shrink-0 rounded cursor-pointer border-0 p-0 overflow-hidden"
               />
               <Input 
                 value={localStroke}
                 onChange={(e) => handleStrokeInput(e.target.value)}
                 className="h-8 text-xs font-mono px-2"
                 maxLength={7}
               />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Width</label>
            <Input 
              type="number" 
              min="1" 
              max="10"
              value={style.strokeWidth} 
              onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
              className="h-8 text-sm"
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
                className="h-8 w-8 shrink-0 rounded cursor-pointer border-0 p-0 overflow-hidden"
              />
               <Input 
                 value={localFill}
                 onChange={(e) => handleFillInput(e.target.value)}
                 className="h-8 text-xs font-mono px-2"
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
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={() => onStyleChange({
              stroke: '#3b82f6',
              fill: '#3b82f6',
              fillOpacity: 0.2,
              strokeWidth: 2,
              pattern: 'solid'
            })} 
            className="flex-1 h-9 text-xs"
          >
            Reset
          </Button>
          <Button onClick={onSave} className="flex-1 h-9 bg-surface-900 hover:bg-surface-800 text-white text-xs">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
