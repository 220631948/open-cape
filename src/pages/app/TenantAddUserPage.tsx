import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Info } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useProfile } from '@/src/contexts/useProfile';
import { addMemberToTenant, getTenantRoles, TenantRole } from '@/src/lib/tenancy';

export const TenantAddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [roles, setRoles] = useState<TenantRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      if (profile?.tenantId) {
        const r = await getTenantRoles(profile.tenantId);
        setRoles(r);
      }
    }
    loadRoles();
  }, [profile]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    if (profile?.role !== 'owner' && profile?.role !== 'admin') {
      setError('You do not have permission to invite users.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (profile?.tenantId) {
        await addMemberToTenant(profile.tenantId, inviteEmail, inviteRole);
        navigate('/app/team');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to invite user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 font-sans">
      <div>
        <button 
          onClick={() => navigate('/app/team')}
          className="flex items-center text-sm text-surface-500 hover:text-surface-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Team
        </button>
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Invite New User</h1>
        <p className="text-surface-500">Add a new member to your organization.</p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <form onSubmit={handleInvite} className="p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-surface-500 mt-2">
                Users must sign in with Google or Email once to create a platform profile before they can be assigned a role.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Initial Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map(role => (
                  <label
                    key={role.id}
                    className={`
                      relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none 
                      ${inviteRole === role.id ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50' : 'border-surface-200 bg-white hover:bg-surface-50'}
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      className="sr-only"
                      checked={inviteRole === role.id}
                      onChange={() => setInviteRole(role.id)}
                    />
                    <div className="flex flex-col">
                      <span className={`block text-sm font-medium ${inviteRole === role.id ? 'text-primary-900' : 'text-surface-900'}`}>
                        {role.name}
                      </span>
                      <span className={`mt-1 flex items-center text-xs ${inviteRole === role.id ? 'text-primary-700' : 'text-surface-500'}`}>
                        {role.description}
                      </span>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-surface-400">
                          {role.permissions.length} Permissions
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-50 -mx-6 -mb-6 p-6 mt-8 flex justify-end gap-3 border-t border-surface-200">
            <Button type="button" variant="outline" onClick={() => navigate('/app/team')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !inviteEmail}>
              {loading ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">About User Invitations</p>
          <p className="mt-1">When you invite a user, they will have access immediately upon signing in with the matching email address. You can change their role at any time from the Team page.</p>
        </div>
      </div>
    </div>
  );
};
