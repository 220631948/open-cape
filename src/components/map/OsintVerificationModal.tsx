import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useOSINTVerification } from '@/hooks/useOSINTVerification';

interface OsintVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureInfo: { layerId: string; feature: any } | null;
  onVerifyComplete?: () => void;
}

export const OsintVerificationModal: React.FC<OsintVerificationModalProps> = ({
  isOpen,
  onClose,
  featureInfo,
  onVerifyComplete
}) => {
  const { saveVerification } = useOSINTVerification();
  const [loading, setLoading] = useState(false);

  const initialLat = featureInfo?.feature?.geometry?.coordinates?.[1] || 0;
  const initialLng = featureInfo?.feature?.geometry?.coordinates?.[0] || 0;

  const [lat, setLat] = useState<string>(initialLat.toString());
  const [lng, setLng] = useState<string>(initialLng.toString());
  const [reason, setReason] = useState("");

  // Update inputs if featureInfo changes
  React.useEffect(() => {
    if (featureInfo) {
      setLat(featureInfo.feature.geometry?.coordinates?.[1]?.toString() || "0");
      setLng(featureInfo.feature.geometry?.coordinates?.[0]?.toString() || "0");
      setReason("");
    }
  }, [featureInfo]);

  const handleSave = async () => {
    if (!featureInfo) return;
    
    // basic validation
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      alert("Invalid coordinates");
      return;
    }
    
    if (!reason.trim()) {
      alert("Please provide a reason for the location override.");
      return;
    }
    
    setLoading(true);
    try {
      const fId = featureInfo.feature.properties.OBJECTID || featureInfo.feature.properties.id;
      const strippedLayerId = featureInfo.layerId.replace('layer-', '');
      
      await saveVerification(
        strippedLayerId,
        fId.toString(),
        featureInfo.feature.geometry.coordinates,
        [parsedLng, parsedLat],
        reason
      );
      
      onVerifyComplete?.();
      onClose();
    } catch (e: any) {
      alert("Error saving location: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!featureInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Correct Location (OSINT Verification)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-33.918"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="18.423"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Reason</label>
            <Textarea
              placeholder="e.g. Confirmed via street view that the entrance is actually 20m north..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !reason.trim()}>
            {loading ? 'Saving...' : 'Save Correction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
