import React from 'react';
import { ExternalLink, ShieldCheck, Database, Calendar } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { SourceRecord } from '@/src/hooks/useSourceCatalog';
import { SourceBadge } from './SourceBadge';
import { DataStatusBanner } from './DataStatusBanner';

interface ProvenanceCardProps {
  source: SourceRecord;
  className?: string;
  isLive?: boolean;
}

export const ProvenanceCard: React.FC<ProvenanceCardProps> = ({ source, className, isLive = false }) => {
  const getIntegrationLabel = () => {
    if (isLive) return 'Currently Active';
    if (source.verificationStatus === 'verified-integration') return 'Verified System Integration';
    if (source.verificationStatus === 'simulated') return 'Simulated Fallback Integration';
    if (source.verificationStatus === 'pending-integration') return 'Pending System Integration';
    if (source.verificationStatus === 'metadata-only') return 'Metadata Only / Registry';
    return 'Pending System Integration';
  };

  const getStatusBanner = () => {
    if (isLive) return <DataStatusBanner variant="success" />;
    if (source.verificationStatus === 'verified-integration') return <DataStatusBanner variant="info" title="System Status" description="Verified sources are live. Application is performing normally." />;
    if (source.verificationStatus === 'simulated') return <DataStatusBanner variant="info" title="Simulated Integration" description="Running in fallback simulated mode. Live credentials not active." />;
    return <DataStatusBanner variant="warning" />;
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 bg-surface-50 border-b border-surface-100 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-surface-900 flex items-center gap-2">
             {source.name}
             <SourceBadge source={source} showIcon={false} />
          </h3>
          <a href={source.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 mt-1">
             <ExternalLink className="h-3 w-3" />
             Visit Source Website
          </a>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {getStatusBanner()}

        <div className="space-y-3">
          <div className="flex items-start gap-3">
             <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
             <div>
                <p className="text-xs font-semibold text-surface-900 uppercase tracking-widest mb-0.5">Quality / License</p>
                <p className="text-sm text-surface-600">{source.qualityBadge} &middot; {source.licenseNote}</p>
             </div>
          </div>
          
          <div className="flex items-start gap-3">
             <Database className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
             <div>
                <p className="text-xs font-semibold text-surface-900 uppercase tracking-widest mb-0.5">Coverage / Category</p>
                <p className="text-sm text-surface-600 truncate">{source.coverage} &middot; {source.category}</p>
             </div>
          </div>
          
          <div className="flex items-start gap-3">
             <Calendar className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
             <div>
                <p className="text-xs font-semibold text-surface-900 uppercase tracking-widest mb-0.5">Verification Status</p>
                <p className="text-sm text-surface-600">{getIntegrationLabel()}</p>
             </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-surface-100">
           <p className="text-xs text-surface-500 leading-relaxed italic">{source.purposeDesc}</p>
        </div>
      </div>
    </Card>
  );
};
