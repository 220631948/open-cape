import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { Badge } from '@/src/components/ui/Badge';
import { updateProfile } from 'firebase/auth';
import { useProfile } from '@/src/contexts/useProfile';
import { useLayerPreferences } from '@/src/contexts/useLayerPreferences';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Check, Edit2, Map, Layers, Bell } from 'lucide-react';
import { VERIFIED_SOURCES } from '@/src/hooks/useSourceCatalog';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, updateProfile: updateFirestoreProfile } = useProfile();
  const { preferences: layerPrefs, updatePreferences: updateLayerPrefs } = useLayerPreferences();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [defaultLat, setDefaultLat] = useState(profile?.defaultMapCenter?.lat.toString() || '-33.9249');
  const [defaultLng, setDefaultLng] = useState(profile?.defaultMapCenter?.lng.toString() || '18.4241');
  const [defaultZoom, setDefaultZoom] = useState(profile?.defaultZoom?.toString() || '12');
  const [preferredLayers, setPreferredLayers] = useState<string[]>(layerPrefs?.defaultViews || profile?.preferredLayers || []);

  const [isEditingNotif, setIsEditingNotif] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(profile?.notificationPreferences?.emailAlerts ?? true);
  const [productUpdates, setProductUpdates] = useState(profile?.notificationPreferences?.productUpdates ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && !isEditing) {
      setDisplayName(user.displayName || '');
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (profile && !isEditingPrefs && !isEditingNotif) {
      setDefaultLat(profile.defaultMapCenter?.lat.toString() || '-33.9249');
      setDefaultLng(profile.defaultMapCenter?.lng.toString() || '18.4241');
      setDefaultZoom(profile.defaultZoom?.toString() || '12');
      
      setEmailAlerts(profile.notificationPreferences?.emailAlerts ?? true);
      setProductUpdates(profile.notificationPreferences?.productUpdates ?? false);
    }
  }, [profile, isEditingPrefs, isEditingNotif]);

  useEffect(() => {
    if ((layerPrefs || profile) && !isEditingPrefs) {
      setPreferredLayers(layerPrefs?.defaultViews || profile?.preferredLayers || []);
    }
  }, [layerPrefs, profile, isEditingPrefs]);

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(user, { displayName });
      
      // 2. Update users collection
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        displayName,
        updatedAt: serverTimestamp()
      });
      
      // 3. Update user_profiles collection
      await updateFirestoreProfile({ fullName: displayName });
      
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateFirestoreProfile({
        defaultMapCenter: {
          lat: parseFloat(defaultLat) || -33.9249,
          lng: parseFloat(defaultLng) || 18.4241
        },
        defaultZoom: parseInt(defaultZoom, 10) || 12,
        preferredLayers // legacy
      });
      
      await updateLayerPrefs({
        defaultViews: preferredLayers
      });
      
      setSuccess('Map preferences updated successfully.');
      setIsEditingPrefs(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update map preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateFirestoreProfile({
        notificationPreferences: {
           emailAlerts,
           productUpdates
        }
      });
      
      setSuccess('Notification preferences updated successfully.');
      setIsEditingNotif(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLayerPreference = (layerId: string) => {
    setPreferredLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(l => l !== layerId)
        : [...prev, layerId]
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Profile & Settings</h1>
        <p className="text-surface-500">Manage your personal information and map workspace defaults.</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-100">{success}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Your identity is securely managed by Firebase.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-surface-50 border border-surface-200 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="h-20 w-20 rounded-full border-4 border-white shadow-sm" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-surface-700 text-white flex items-center justify-center text-2xl font-bold shadow-sm shrink-0">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            
            <div className="flex-1 space-y-3 w-full">
              {!isEditing ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-semibold text-xl text-surface-900">{user?.displayName || 'Unknown User'}</h3>
                     <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-surface-400 hover:text-surface-900" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-3 w-3" />
                     </Button>
                  </div>
                  <p className="text-surface-500">{user?.email}</p>
                </div>
              ) : (
                <form onSubmit={handleSaveIdentity} className="space-y-3 w-full max-w-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-surface-700">Display Name</label>
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      placeholder="Jane Doe" 
                      maxLength={128}
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user?.displayName || '');
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
              
              <div className="flex items-center gap-2 pt-2 border-t border-surface-200">
                <Badge variant={user?.emailVerified ? 'success' : 'secondary'}>
                   {user?.emailVerified ? 'Email Verified' : 'Unverified'}
                </Badge>
                <div className="text-xs text-surface-400 font-mono bg-white px-2 py-1 rounded border border-surface-200">
                   UID: {user?.uid.substring(0, 8)}...
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-surface-100">
          <div>
            <CardTitle>Map Preferences</CardTitle>
            <CardDescription className="mt-1">Configure your default workspace initialization.</CardDescription>
          </div>
          {!isEditingPrefs && (
             <Button variant="outline" size="sm" onClick={() => setIsEditingPrefs(true)}>
                <Edit2 className="h-3 w-3 mr-2" /> Edit
             </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {!isEditingPrefs ? (
             <div className="space-y-8">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-1 flex items-center gap-2">
                       <Map className="h-3.5 w-3.5" /> Default Focus
                    </h4>
                    <p className="text-surface-900 font-medium">
                       {profile?.defaultMapCenter?.lat.toFixed(4) || '-33.9249'}, {profile?.defaultMapCenter?.lng.toFixed(4) || '18.4241'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-1">Zoom Level</h4>
                    <p className="text-surface-900 font-medium">{profile?.defaultZoom || 12}</p>
                  </div>
               </div>

               <div>
                 <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" /> Preferred Layers On Startup
                 </h4>
                 {profile?.preferredLayers && profile.preferredLayers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                       {profile.preferredLayers.map(layer => (
                          <span key={layer} className="px-2.5 py-1 bg-surface-100 text-surface-700 text-xs rounded-md font-medium border border-surface-200">
                             {layer}
                          </span>
                       ))}
                    </div>
                 ) : (
                    <p className="text-sm text-surface-500 italic">No preferred layers selected. Map will load empty context.</p>
                 )}
               </div>
             </div>
          ) : (
             <form onSubmit={handleSavePrefs} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-surface-700">Latitude</label>
                      <Input type="number" step="0.0001" value={defaultLat} onChange={e => setDefaultLat(e.target.value)} disabled={isSaving} required />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-surface-700">Longitude</label>
                      <Input type="number" step="0.0001" value={defaultLng} onChange={e => setDefaultLng(e.target.value)} disabled={isSaving} required />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-surface-700">Zoom Level (1-20)</label>
                      <Input type="number" min="1" max="20" value={defaultZoom} onChange={e => setDefaultZoom(e.target.value)} disabled={isSaving} required />
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-medium text-surface-700">Preferred Layers On Startup</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200">
                      {VERIFIED_SOURCES.map(source => (
                         <label key={source.sourceId} className="flex items-center gap-3 cursor-pointer">
                            <input 
                               type="checkbox" 
                               checked={preferredLayers.includes(source.sourceId)} 
                               onChange={() => toggleLayerPreference(source.sourceId)}
                               className="rounded border-surface-300 text-rose-600 focus:ring-rose-500"
                               disabled={isSaving}
                            />
                            <span className="text-sm font-medium text-surface-900">{source.name}</span>
                         </label>
                      ))}
                   </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-surface-100">
                   <Button type="button" variant="outline" onClick={() => setIsEditingPrefs(false)} disabled={isSaving}>Cancel</Button>
                   <Button type="submit" disabled={isSaving} className="bg-surface-900 text-white hover:bg-surface-800">
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                   </Button>
                </div>
             </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-surface-100">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription className="mt-1">Manage what alerts you receive.</CardDescription>
          </div>
          {!isEditingNotif && (
             <Button variant="outline" size="sm" onClick={() => setIsEditingNotif(true)}>
                <Edit2 className="h-3 w-3 mr-2" /> Edit
             </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
           {!isEditingNotif ? (
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${profile?.notificationPreferences?.emailAlerts ?? true ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-100 text-surface-400'}`}>
                       <Bell className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-surface-900">Email Alerts</p>
                       <p className="text-xs text-surface-500">{(profile?.notificationPreferences?.emailAlerts ?? true) ? 'Enabled' : 'Disabled'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${profile?.notificationPreferences?.productUpdates ?? false ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-400'}`}>
                       <Bell className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-surface-900">Product Updates</p>
                       <p className="text-xs text-surface-500">{(profile?.notificationPreferences?.productUpdates ?? false) ? 'Enabled' : 'Disabled'}</p>
                    </div>
                 </div>
              </div>
           ) : (
              <form onSubmit={handleSaveNotifs} className="space-y-4">
                 <label className="flex items-center justify-between p-4 bg-surface-50 rounded-lg border border-surface-200 cursor-pointer hover:bg-surface-100 transition-colors">
                    <div>
                       <p className="text-sm font-medium text-surface-900">Important Email Alerts</p>
                       <p className="text-xs text-surface-500">Project sharing, mentions, and system alerts.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5 border-surface-300"
                      checked={emailAlerts}
                      onChange={e => setEmailAlerts(e.target.checked)}
                      disabled={isSaving}
                    />
                 </label>
                 
                 <label className="flex items-center justify-between p-4 bg-surface-50 rounded-lg border border-surface-200 cursor-pointer hover:bg-surface-100 transition-colors">
                    <div>
                       <p className="text-sm font-medium text-surface-900">Product Updates</p>
                       <p className="text-xs text-surface-500">News about new data sources and features.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5 border-surface-300"
                      checked={productUpdates}
                      onChange={e => setProductUpdates(e.target.checked)}
                      disabled={isSaving}
                    />
                 </label>

                 <div className="flex gap-2 justify-end pt-4 border-t border-surface-100">
                    <Button type="button" variant="outline" onClick={() => setIsEditingNotif(false)} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" disabled={isSaving} className="bg-surface-900 text-white hover:bg-surface-800">
                       {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                 </div>
              </form>
           )}
        </CardContent>
      </Card>
    </div>
  );
};
