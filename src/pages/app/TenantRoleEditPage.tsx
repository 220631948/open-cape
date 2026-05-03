import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useProfile } from '@/src/contexts/useProfile';
import { getTenantRoles, createTenantRole, updateTenantRole } from '@/src/lib/tenancy';

export const TenantRoleEditPage: React.FC = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [rolePerms, setRolePerms] = useState<string>('');
  
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
              setRolePerms(target.permissions.join(', '));
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
      const permissionsArray = rolePerms.split(',').map(p => p.trim()).filter(Boolean);
      
      if (roleId && roleId !== 'new') {
        await updateTenantRole(profile.tenantId, roleId, {
          name: roleName,
          description: roleDesc,
          permissions: permissionsArray,
        });
      } else {
        await createTenantRole(profile.tenantId, {
          name: roleName,
          description: roleDesc,
          permissions: permissionsArray,
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
    <div className="p-8 max-w-2xl mx-auto space-y-8 font-sans">
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
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Role Name</label>
              <Input
                type="text"
                placeholder="e.g. Field Surveyor"
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
                required
                disabled={!!error && roleId !== 'new'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <Input
                type="text"
                placeholder="e.g. Can view maps and collect field data"
                value={roleDesc}
                onChange={e => setRoleDesc(e.target.value)}
                required
                disabled={!!error && roleId !== 'new'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Permissions</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. read_map, import_geojson, export_data"
                  value={rolePerms}
                  onChange={e => setRolePerms(e.target.value)}
                  disabled={!!error && roleId !== 'new'}
                />
              </div>
              <p className="text-xs text-surface-500 mt-2">
                Enter a comma-separated list of permission strings. See the Platform Permissions page for available options.
              </p>
            </div>
          </div>

          <div className="bg-surface-50 -mx-6 -mb-6 p-6 mt-8 flex justify-end gap-3 border-t border-surface-200">
            <Button type="button" variant="outline" onClick={() => navigate('/app/roles')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || (!!error && roleId !== 'new')}>
              {saving ? 'Saving...' : (roleId === 'new' ? 'Create Role' : 'Save Changes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
