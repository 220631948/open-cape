import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Shield, ArrowLeft, User, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProfile } from '@/contexts/useProfile';
import { getTenantUsers, getTenantRoles, updateMemberRole, TenantRole } from '@/lib/tenancy';

export const TenantUserRolePage: React.FC = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roles, setRoles] = useState<TenantRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (profile?.tenantId && uid) {
        try {
          const [uLists, r] = await Promise.all([
            getTenantUsers(profile.tenantId),
            getTenantRoles(profile.tenantId)
          ]);
          const targetUser = uLists.find(u => u.uid === uid);
          if (targetUser) {
            setUser(targetUser);
            setSelectedRole(targetUser.role || 'viewer');
          } else {
            setError('User not found in this organization.');
          }
          setRoles(r);
        } catch (err: any) {
          setError(err.message || 'Failed to load user data');
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [profile, uid]);

  const handleSave = async () => {
    if (!profile?.tenantId || !uid) return;
    
    if (profile?.role !== 'owner' && profile?.role !== 'admin') {
      setError('You do not have permission to modify roles.');
      return;
    }
    
    // Prevent self-demotion from owner if they are the only owner, but for safety just let backend handle it,
    // or add a simple check:
    if (user?.uid === profile.uid && selectedRole !== 'owner' && profile.role === 'owner') {
       if (!confirm("You are changing your own role away from Owner. You may lose access to these settings. Continue?")) {
         return;
       }
    }

    setSaving(true);
    setError(null);
    try {
      await updateMemberRole(uid, selectedRole);
      navigate('/app/team');
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setSaving(false);
    }
  };

  const activeRoleConfig = roles.find(r => r.id === selectedRole) || roles.find(r => r.name.toLowerCase() === selectedRole) || null;

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-rose-50 text-rose-700 p-6 rounded-lg text-sm border border-rose-200">
          <p className="font-bold text-base mb-2">Error</p>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => navigate('/app/team')}>Return to Team</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <button 
          onClick={() => navigate('/app/team')}
          className="flex items-center text-sm text-surface-500 hover:text-surface-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Team
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-surface-900">{user?.fullName || 'Unnamed User'}</h1>
            <p className="text-surface-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
            <div className="bg-surface-50 px-6 py-4 border-b border-surface-200">
              <h3 className="font-bold text-surface-900 text-sm">Assign Role</h3>
              <p className="text-xs text-surface-500 mt-1">Select the user's primary role</p>
            </div>
            <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-all
                    ${selectedRole === role.id
                      ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                      : 'border-surface-200 hover:bg-surface-50 hover:border-surface-300'}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-bold ${selectedRole === role.id ? 'text-primary-900' : 'text-surface-900'}`}>{role.name}</span>
                    {(selectedRole === role.id) && <Check className="w-4 h-4 text-primary-600" />}
                  </div>
                  <p className={`text-xs mt-1 ${selectedRole === role.id ? 'text-primary-700' : 'text-surface-500'}`}>{role.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-surface-200 flex justify-between items-center bg-surface-50">
              <div>
                <h3 className="font-bold text-surface-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-600" />
                  Effective Permissions
                </h3>
                <p className="text-xs text-surface-500 mt-1">
                  Preview of access rights granted by the {activeRoleConfig?.name} role.
                </p>
              </div>
            </div>
            
            <div className="p-0">
              {!activeRoleConfig ? (
                <div className="p-6 text-center text-surface-500 flex items-center justify-center gap-2 h-32">
                   <AlertTriangle className="w-5 h-5 text-surface-400" />
                   Select a valid role to see permissions.
                </div>
              ) : activeRoleConfig.permissions.length === 0 ? (
                <div className="p-6 text-center text-surface-500 h-32 flex items-center justify-center">
                  This role has no explicit permissions assigned.
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {activeRoleConfig.permissions.map(perm => (
                    <div key={perm} className="p-4 px-6 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <code className="text-xs font-mono text-surface-700 bg-surface-100 px-2 py-1 rounded">
                        {perm}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-surface-900">Save changes</p>
              <p className="text-xs text-surface-500 mt-1">Changes are applied immediately.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/app/team')} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || selectedRole === user.role}>
                {saving ? 'Saving...' : 'Save Assignments'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
