import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useProfile } from '@/src/contexts/useProfile';
import { getTenantUsers, getTenant, removeMemberFromTenant } from '@/src/lib/tenancy';
import { Shield, Mail, CheckCircle2, Database, Edit2, Trash2 } from 'lucide-react';
import { seedTenantData } from '@/src/utils/seedTenancy';
import { Button } from '@/src/components/ui/Button';

export const TenantUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [users, setUsers] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const handleRemoveUser = async (userId: string) => {
    if (!profile?.tenantId || (profile?.role !== 'owner' && profile?.role !== 'admin')) return;
    if (!confirm('Are you sure you want to remove this user from the organization?')) return;
    
    try {
      await removeMemberFromTenant(profile.tenantId, userId);
      const u = await getTenantUsers(profile.tenantId);
      setUsers(u);
    } catch (err: any) {
      alert('Failed to remove user: ' + err.message);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedTenantData();
      alert('Tenant seeding completed. Refreshing data...');
      window.location.reload();
    } catch (err: any) {
      alert('Seeding failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (profile?.tenantId) {
        const [t, u] = await Promise.all([
          getTenant(profile.tenantId),
          getTenantUsers(profile.tenantId)
        ]);
        setTenant(t);
        setUsers(u);
      }
      setLoading(false);
    }
    loadData();
  }, [profile]);

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Team Management</h1>
          <p className="text-surface-500">Manage access and roles for {tenant?.name || 'your organization'}.</p>
        </div>
        <div className="flex gap-3">
          {(profile?.role === 'owner' || profile?.role === 'admin') && (
            <Button 
              size="sm" 
              onClick={() => navigate('/app/team/invite')}
            >
              <Mail className="w-4 h-4 mr-2" /> Invite User
            </Button>
          )}
          {profile?.role === 'owner' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              onClick={handleSeed}
              disabled={seeding}
            >
              <Database className="w-4 h-4 mr-2" /> {seeding ? 'Seeding...' : 'Seed Sample Organization'}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-surface-50 border-b border-surface-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500">
             Active Members ({users.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-200 text-xs text-surface-400 bg-white">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Joined</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase shrink-0">
                        {u.fullName?.substring(0, 2) || u.email?.substring(0, 2) || u.uid.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-surface-900">{u.fullName || 'Unnamed User'}</div>
                        <div className="text-[10px] text-surface-500">{u.email || u.uid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-surface-400" />
                      <span className="text-xs font-medium capitalize text-surface-700">{u.role || 'member'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                       <CheckCircle2 className="w-2.5 h-2.5" /> Active
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-surface-400">
                    {u.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                     {(profile?.role === 'owner' || profile?.role === 'admin') && (
                      <div className="flex justify-end gap-2">
                        {u.uid !== profile.uid && (
                          <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-xs text-indigo-600 h-8"
                             onClick={() => navigate('/app/team/' + u.uid + '/edit')}
                          >
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        )}
                        {u.uid !== profile.uid && (
                          <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8"
                             onClick={() => handleRemoveUser(u.uid)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
