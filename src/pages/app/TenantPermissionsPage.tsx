import React from 'react';
import { Lock, Check, ShieldAlert } from 'lucide-react';

export const TenantPermissionsPage: React.FC = () => {
  const categories = [
    {
      group: 'Map & Data',
      perms: [
        { id: 'read_map', name: 'View public layers', desc: 'Required for all users.' },
        { id: 'import_geojson', name: 'Import GeoJSON', desc: 'Upload private organization data.' },
        { id: 'export_data', name: 'Export Data', desc: 'Download CSV/GeoJSON from layers.' },
      ]
    },
    {
      group: 'Analytical Tools',
      perms: [
        { id: 'run_analysis', name: 'Environmental Intelligence', desc: 'Run NDWI/NDVI assessments.' },
        { id: 'verify_osint', name: 'Verify OSINT', desc: 'Mark reports as ground-truth.' },
      ]
    },
    {
      group: 'Administration',
      perms: [
        { id: 'manage_users', name: 'Manage Team', desc: 'Invite or remove members.' },
        { id: 'edit_settings', name: 'Edit Workspace', desc: 'Modify org name and domain.' },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Platform Permissions</h1>
        <p className="text-surface-500">A detailed breakdown of all available system privileges.</p>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat.group} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <h3 className="px-6 py-4 bg-surface-50 border-b border-surface-200 text-xs font-bold uppercase tracking-widest text-surface-500">
              {cat.group}
            </h3>
            <div className="divide-y divide-surface-100">
              {cat.perms.map(p => (
                <div key={p.id} className="p-6 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-surface-900 flex items-center gap-2">
                       {p.name}
                       <code className="text-[10px] font-mono text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded uppercase">{p.id}</code>
                    </div>
                    <p className="text-xs text-surface-500 mt-1">{p.desc}</p>
                  </div>
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
         <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
         <div className="text-sm text-amber-800 leading-relaxed">
            <p className="font-bold">System Level Restrictions</p>
            <p>Some permissions are hard-coded to your subscription tier (Spark Enterprise) and cannot be assigned to Viewer roles.</p>
         </div>
      </div>
    </div>
  );
};
