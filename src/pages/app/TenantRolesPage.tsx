import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, Info, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useProfile } from '@/src/contexts/useProfile';
import { getTenantRoles, deleteTenantRole, TenantRole, getTenantUsers } from '@/src/lib/tenancy';

export const TenantRolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [roles, setRoles] = useState<TenantRole[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      if (profile?.tenantId) {
        const r = await getTenantRoles(profile.tenantId);
        const u = await getTenantUsers(profile.tenantId);
        setRoles(r);
        setUsers(u);
      }
      setLoading(false);
    }
    loadRoles();
  }, [profile]);

  const handleDeleteRole = async (roleId: string) => {
    if (!profile?.tenantId || profile.role !== 'owner') return;
    if (!confirm("Are you sure you want to delete this custom role?")) return;

    try {
      await deleteTenantRole(profile.tenantId, roleId);
      const r = await getTenantRoles(profile.tenantId);
      setRoles(r);
    } catch (err: any) {
      alert("Failed to delete role: " + err.message);
    }
  };

  const getUserCount = (roleId: string) => {
    return users.filter(u => u.role === roleId).length;
  };

  if (loading) return (
    <div className="p-8 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Roles & Permissions</h1>
          <p className="text-surface-500">Configure access levels for organization members.</p>
        </div>
        {profile?.role === 'owner' && (
          <Button onClick={() => navigate('/app/roles/new')} className="bg-indigo-600 text-white hover:bg-indigo-700">
             <Plus className="w-4 h-4 mr-2" /> Custom Role
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {roles.map(role => (
            <div key={role.id} className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
               {/* Decorative background element for system roles */}
               {role.isSystem && (
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-24 h-24" />
                 </div>
               )}
               
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-surface-900 capitalize">{role.name}</h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">
                       {getUserCount(role.id)} Users
                    </span>
                    {role.isSystem && (
                       <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                         System Default
                       </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-600 leading-relaxed max-w-2xl">{role.description}</p>
                </div>
              </div>

               <div className="mt-6 pt-6 border-t border-surface-100 relative z-10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-3">Assigned Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                     {role.permissions.map((perm, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-50 border border-surface-200 text-xs text-surface-700 font-medium">
                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                           {perm.replace(/_/g, ' ')}
                        </div>
                     ))}
                     {role.permissions.length === 0 && (
                       <span className="text-xs text-surface-400 italic">No specific permissions defined.</span>
                     )}
                  </div>
               </div>
               
               {profile?.role === 'owner' && !role.isSystem && (
                 <div className="mt-6 pt-4 border-t border-surface-50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="sm" onClick={() => navigate(`/app/roles/${role.id}/edit`)} className="text-xs text-indigo-600">
                     <Edit2 className="w-3 h-3 mr-1" /> Edit
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)} className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                     <Trash2 className="w-3 h-3 mr-1" /> Delete
                   </Button>
                 </div>
               )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                 <Info className="w-5 h-5 text-indigo-300" />
              </div>
              <h3 className="font-bold">RBAC Enforcement</h3>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Permissions are enforced at both the UI and API level. Analysts cannot delete authoritative source data, and Viewers cannot create new drawings.
              </p>
           </div>

           <div className="bg-surface-50 border border-surface-200 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500">Usage Recommendation</h3>
              <div className="space-y-3">
                 <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                    <p className="text-[11px] text-surface-600 leading-tight">Use the <strong>Analyst</strong> role for your primary geospatial engineers.</p>
                 </div>
                 <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                    <p className="text-[11px] text-surface-600 leading-tight">Reserve <strong>Owner</strong> for IT administrators and billing leads.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
