import React, { useState, useEffect } from 'react';
import { useProfile } from '@/src/contexts/useProfile';
import { getTenant, updateTenant } from '@/src/lib/tenancy';
import { Shield, Building2, UserPlus, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export const TenantSettingsPage: React.FC = () => {
  const { profile } = useProfile();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    async function loadData() {
      if (profile?.tenantId) {
        const t = await getTenant(profile.tenantId);
        setTenant(t);
        setOrgName(t?.name || '');
      }
      setLoading(false);
    }
    loadData();
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.tenantId || !orgName) return;
    setSaving(true);
    try {
      await updateTenant(profile.tenantId, { name: orgName });
      alert('Organization settings updated.');
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Organization Settings</h1>
          <p className="text-surface-500">Configure your workspace identity, security, and usage limits.</p>
        </div>
        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-widest border border-indigo-200">
          Tenant ID: {tenant?.id}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* General info */}
          <section className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-surface-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1">Organization Name</label>
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1">Workspace Region</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="Western Cape, SA"
                    className="w-full px-3 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm text-surface-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1">Primary Domain</label>
                  <input 
                    type="text" 
                    placeholder="e.g. cityanalysts.com"
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              {profile?.role === 'owner' && (
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>
          </section>

          {/* Security */}
          <section className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-surface-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Data Isolation & Security
            </h2>
            <div className="space-y-4 text-xs text-surface-600 leading-relaxed">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold text-emerald-900 mb-1">Row-Level Security Enabled</p>
                   <p>All your layers, GeoJSON imports, and drawings are automatically tagged with your Tenant ID and isolated at the database level.</p>
                </div>
              </div>
              <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl space-y-3">
                 <div className="flex items-center justify-between">
                   <span className="font-semibold text-surface-700">Audit Logging</span>
                   <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                   </div>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="font-semibold text-surface-700">Enforce verified emails</span>
                   <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                   </div>
                 </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Subscription/Limits */}
          <section className="bg-gradient-to-br from-surface-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl space-y-6 border border-white/10">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Workspace Tier</h2>
              <div className="text-2xl font-bold flex items-center gap-2">
                 Enterprise <div className="text-[10px] px-2 py-0.5 bg-indigo-500 rounded-full">Spark</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
                   <span>User Capacity</span>
                   <span>{tenant?.currentUsers || 1} / {tenant?.maxUsers || 50}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-emerald-400" 
                    style={{ width: `${((tenant?.currentUsers || 1) / (tenant?.maxUsers || 50)) * 100}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
                   <span>Private Storage</span>
                   <span>240MB / 1GB</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-400 w-1/4" />
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
               <UserPlus className="w-4 h-4 mr-2" /> Purchase Seat
            </Button>
          </section>

          {/* Danger Zone */}
          <section className="p-6 rounded-2xl border border-rose-100 bg-rose-50/30 space-y-4">
             <h2 className="text-sm font-bold text-rose-600 flex items-center gap-2 uppercase tracking-widest">
               <AlertTriangle className="w-4 h-4" /> Danger Zone
             </h2>
             <p className="text-[10px] text-rose-600/80 leading-relaxed">
               Suspending your tenant will immediately block access for all {tenant?.currentUsers} users and hide your private layers.
             </p>
             <button className="w-full py-2 border border-rose-200 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 transition-colors">
               Suspend Organization
             </button>
          </section>
        </div>
      </div>
    </div>
  );
};
