import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProfile } from '@/contexts/useProfile';
import { getTenantRoles, createTenantRole, updateTenantRole } from '@/lib/tenancy';
import { cn } from '@/lib/utils';

export const TenantRoleEditPage: React.FC = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const AVAILABLE_PERMISSIONS = [
    { id: 'read_map', name: 'Read Map', description: 'Can view the map and layer data' },
    { id: 'import_geojson', name: 'Import GeoJSON', description: 'Can upload and process custom spatial data' },
    { id: 'create_annotations', name: 'Create Annotations', description: 'Can add notes and observations to features' },
    { id: 'create_drawings', name: 'Create Drawings', description: 'Can use drawing tools to create custom shapes' },
    { id: 'verify_data', name: 'Verify Data', description: 'Can perform OSINT verification and location overrides' },
    { id: 'export_data', name: 'Export Data', description: 'Can export maps as PDF or feature snapshots' },
    { id: 'manage_users', name: 'Manage Users', description: 'Can invite members and change roles' },
    { id: 'manage_billing', name: 'Manage Billing', description: 'Can view and update subscription details' },
  ];

  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  
  const [loading, setLoading] = useState(roleId !== 'new');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRole() {
      if (profile?.tenantId && roleId && roleId !== 'new') {
        try {
          const r = await getTenantRoles(profile.tenantId);
          const target = r.find(role => role.id === roleId);
          if (target) {
            if (target.isSystem) {
              setError("System roles cannot be edited.");
            } else {
              setRoleName(target.name);
              setRoleDesc(target.description);
              setSelectedPerms(target.permissions);
            }
          } else {
            setError('Role not found.');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load role');
        } finally {
          setLoading(false);
        }
      }
    }
    loadRole();
  }, [profile, roleId]);

  const togglePermission = (permId: string) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenantId) return;
    
    if (profile?.role !== 'owner') {
      setError('Only the organization owner can modify roles.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (roleId && roleId !== 'new') {
        await updateTenantRole(profile.tenantId, roleId, {
          name: roleName,
          description: roleDesc,
          permissions: selectedPerms,
        });
      } else {
        await createTenantRole(profile.tenantId, {
          name: roleName,
          description: roleDesc,
          permissions: selectedPerms,
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        });
      }
      navigate('/app/roles');
    } catch (err: any) {
      setError(err.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 font-sans">
      <div>
        <button 
          onClick={() => navigate('/app/roles')}
          className="flex items-center text-sm text-surface-500 hover:text-surface-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Roles
        </button>
        <h1 className="text-3xl font-bold text-surface-900 mb-2">
          {roleId === 'new' ? 'Create Custom Role' : 'Edit Custom Role'}
        </h1>
        <p className="text-surface-500">Define access permissions for this role.</p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2 ml-1">Role Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Field Surveyor"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  required
                  className="bg-surface-50 border-surface-200"
                  disabled={!!error && roleId !== 'new'}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2 ml-1">Brief Description</label>
                <Input
                  type="text"
                  placeholder="e.g. Can view maps and collect field data"
                  value={roleDesc}
                  onChange={e => setRoleDesc(e.target.value)}
                  required
                  className="bg-surface-50 border-surface-200"
                  disabled={!!error && roleId !== 'new'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-4 ml-1">Assigned Capabilities</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label 
                    key={perm.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                      selectedPerms.includes(perm.id) 
                        ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                        : "bg-white border-surface-200 hover:bg-surface-50"
                    )}
                  >
                    <input 
                      type="checkbox"
                      checked={selectedPerms.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="mt-1 h-4 w-4 rounded border-surface-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold", selectedPerms.includes(perm.id) ? "text-indigo-900" : "text-surface-900")}>
                        {perm.name}
                      </p>
                      <p className="text-[11px] text-surface-500 leading-tight mt-0.5">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-50 -mx-6 -mb-6 p-6 mt-8 flex justify-end gap-3 border-t border-surface-200">
            <Button type="button" variant="ghost" onClick={() => navigate('/app/roles')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]" disabled={saving || (!!error && roleId !== 'new')}>
              {saving ? 'Saving...' : (roleId === 'new' ? 'Create Role' : 'Save Changes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
