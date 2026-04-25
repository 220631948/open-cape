import React from 'react';
import { Drawing } from '@/src/hooks/useDrawings';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { 
  Square, 
  Spline, 
  MapPin, 
  Clock, 
  Lock, 
  Trash2, 
  FolderOpen,
  Map as MapIcon,
  Pencil
} from 'lucide-react';
import { format } from 'date-fns';

interface DrawingCardProps {
  drawing: Drawing;
  onView: (drawing: Drawing) => void;
  onEdit: (drawing: Drawing) => void;
  onDelete: (id: string) => void;
  projectName?: string;
}

export const DrawingCard: React.FC<DrawingCardProps> = ({ 
  drawing, 
  onView, 
  onEdit,
  onDelete,
  projectName 
}) => {
  const Icon = drawing.geometryType === 'Polygon' 
    ? Square 
    : drawing.geometryType === 'LineString' 
      ? Spline 
      : MapPin;

  return (
    <Card className="group hover:border-surface-300 transition-all overflow-hidden border-surface-200">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Swatch/Icon Area */}
        <div 
          className="h-24 flex items-center justify-center bg-surface-50 relative border-b border-surface-100"
          style={{ backgroundColor: drawing.style.fill + '22' }}
        >
          <Icon 
            className="h-8 w-8" 
            style={{ 
              color: drawing.style.stroke, 
              strokeWidth: drawing.style.strokeWidth 
            }} 
          />
          <div className="absolute top-2 right-2">
             <div className="px-1.5 py-0.5 rounded bg-white/80 border border-surface-200 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 text-surface-500">
                <Lock className="h-2 w-2" /> {drawing.privacy}
             </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-3">
             <h3 className="font-semibold text-surface-900 leading-tight truncate mb-1" title={drawing.title}>
               {drawing.title || 'Untitled Drawing'}
             </h3>
             <div className="flex items-center gap-2 text-[10px] text-surface-400 font-medium">
                <span className="capitalize">{drawing.geometryType}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                   <Clock className="h-2.5 w-2.5" />
                   {drawing.updatedAt?.toMillis ? format(drawing.updatedAt.toMillis(), 'MMM d, yyyy') : 'Recently'}
                </span>
             </div>
          </div>

          <div className="space-y-2 mb-4">
             {projectName && (
               <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded w-fit border border-rose-100">
                  <FolderOpen className="h-2.5 w-2.5" />
                  {projectName}
               </div>
             )}
             
             {drawing.sourceRefs.length > 0 ? (
               <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">
                  {drawing.sourceRefs.length} Verified Sources Linked
               </div>
             ) : (
               <div className="text-[9px] text-surface-400 font-bold uppercase tracking-tighter italic">
                  No verified sources
               </div>
             )}
          </div>

          <div className="mt-auto flex items-center gap-2 pt-3 border-t border-surface-100">
             <Button 
               variant="outline" 
               size="sm" 
               className="flex-1 h-8 text-[10px] font-bold uppercase"
               onClick={() => onView(drawing)}
             >
                <MapIcon className="h-3 w-3 mr-1.5" /> View on Map
             </Button>
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-8 w-8 text-surface-400 hover:text-surface-900 hover:bg-surface-100"
               onClick={() => onEdit(drawing)}
             >
                <Pencil className="h-3.5 w-3.5" />
             </Button>
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-8 w-8 text-surface-400 hover:text-rose-600 hover:bg-rose-50"
               onClick={() => onDelete(drawing.id)}
             >
                <Trash2 className="h-3.5 w-3.5" />
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
