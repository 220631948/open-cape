import React from 'react';
import { Annotation } from '@/src/hooks/useAnnotations';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { 
  MessageSquare,
  Clock, 
  Trash2, 
  MousePointer2,
  Map as MapIcon,
  Layers,
  FileText,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';

interface AnnotationCardProps {
  annotation: Annotation;
  onEdit: (annotation: Annotation) => void;
  onDelete: (id: string) => void;
  onView: (annotation: Annotation) => void;
  projectName?: string;
}

export const AnnotationCard: React.FC<AnnotationCardProps> = ({ 
  annotation, 
  onEdit, 
  onDelete,
  onView,
  projectName 
}) => {
  const getTargetIcon = () => {
    switch (annotation.targetType) {
      case 'drawing': return MousePointer2;
      case 'map': return MapIcon;
      case 'saved-map': return Layers;
      case 'placeholder-feature': return FileText;
      default: return MessageSquare;
    }
  };

  const TargetIcon = getTargetIcon();

  return (
    <Card className="hover:border-surface-300 transition-all border-surface-200">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 px-1.5 rounded bg-surface-100 border border-surface-200 text-[9px] font-bold uppercase tracking-wider text-surface-500 flex items-center gap-1">
                   <TargetIcon className="h-2 w-2" /> {annotation.targetType.replace('-', ' ')}
                </div>
                <span className="text-[10px] text-surface-400 font-medium flex items-center gap-1">
                   <Clock className="h-2.5 w-2.5" />
                   {annotation.updatedAt?.toMillis ? format(annotation.updatedAt.toMillis(), 'MMM d, yyyy') : 'Recently'}
                </span>
             </div>
             <h3 className="font-semibold text-surface-900 leading-tight truncate">
               {annotation.title}
             </h3>
          </div>
        </div>

        <p className="text-xs text-surface-600 line-clamp-3 mb-4 leading-relaxed flex-1">
          {annotation.body}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
           {projectName && (
             <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded w-fit border border-rose-100">
                <Building2 className="h-2.5 w-2.5" />
                {projectName}
             </div>
           )}
           
           {annotation.sourceRefs && annotation.sourceRefs.length > 0 ? (
             <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter self-center px-1.5 py-0.5 border border-emerald-200 bg-emerald-50 rounded">
                Verified: {annotation.sourceRefs.length} Source{annotation.sourceRefs.length !== 1 ? 's' : ''}
             </div>
           ) : (
             <div className="text-[9px] text-surface-400 font-bold uppercase tracking-tighter self-center px-1.5 py-0.5 border border-surface-200 bg-surface-50 rounded">
                Metadata: Not Available
             </div>
           )}
           
           {/* If a mock restricted state is needed, we could check for specific keywords in title, but let's just render the available state. */}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
           <Button 
             variant="outline" 
             size="sm" 
             className="h-7 text-[10px] font-bold uppercase"
             onClick={() => onEdit(annotation)}
           >
              Edit
           </Button>
           <Button 
             variant="outline" 
             size="sm" 
             className="h-7 text-[10px] font-bold uppercase"
             onClick={() => onView(annotation)}
           >
              View
           </Button>
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-7 w-7 ml-auto text-surface-400 hover:text-rose-600 hover:bg-rose-50"
             onClick={() => onDelete(annotation.id)}
           >
              <Trash2 className="h-3.5 w-3.5" />
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};
