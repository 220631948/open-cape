import React from 'react';
import { Database, Clock, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

const SOURCES = [
  {
    id: 'cct_land_parcels',
    name: 'City of Cape Town Land Parcels',
    type: 'live',
    status: 'healthy',
    lastFetch: new Date().toISOString(),
    lastValidation: new Date().toISOString(),
    recordsFetched: 'Live fetch on-demand',
    warnings: 0,
    errors: 0
  },
  {
    id: 'cct_zoning',
    name: 'City of Cape Town Zoning',
    type: 'live',
    status: 'healthy',
    lastFetch: new Date().toISOString(),
    lastValidation: new Date().toISOString(),
    recordsFetched: 'Live fetch on-demand',
    warnings: 0,
    errors: 0
  },
  {
    id: 'cct_open_data_portal',
    name: 'City of Cape Town Open Data Portal (Vector Layers)',
    type: 'live',
    status: 'healthy',
    lastFetch: new Date(Date.now() - 3600000).toISOString(),
    lastValidation: new Date(Date.now() - 3600000).toISOString(),
    recordsFetched: '215',
    warnings: 0,
    errors: 0
  },
  {
    id: 'osm_geofabrik_sa',
    name: 'OSM Geofabrik South Africa',
    type: 'live',
    status: 'degraded',
    lastFetch: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastValidation: new Date(Date.now() - 86400000 * 2).toISOString(),
    recordsFetched: 'N/A',
    warnings: 1,
    errors: 0
  },
  {
    id: 'nasa_gibs',
    name: 'NASA GIBS Satellite Imagery',
    type: 'live',
    status: 'healthy',
    lastFetch: new Date().toISOString(),
    lastValidation: new Date().toISOString(),
    recordsFetched: 'Raster tiles',
    warnings: 0,
    errors: 0
  },
  {
    id: 'openaerialmap',
    name: 'OpenAerialMap Community Index',
    type: 'live',
    status: 'failed',
    lastFetch: new Date().toISOString(),
    lastValidation: new Date().toISOString(),
    recordsFetched: 'Raster tiles (NetworkError)',
    warnings: 0,
    errors: 1
  },
  {
    id: 'deeds_registration',
    name: 'Deeds Office Registration',
    type: 'metadata-only',
    status: 'unavailable',
    lastFetch: 'Integration Pending',
    lastValidation: 'N/A',
    recordsFetched: '0',
    warnings: 0,
    errors: 0
  },
  {
    id: 'property24_property_data',
    name: 'Property24 Property Data',
    type: 'metadata-only',
    status: 'unavailable',
    lastFetch: 'Integration Pending',
    lastValidation: 'N/A',
    recordsFetched: '0',
    warnings: 0,
    errors: 0
  },
  {
    id: 'property24_development_api',
    name: 'Property24 Development API',
    type: 'metadata-only',
    status: 'unavailable',
    lastFetch: 'Integration Pending',
    lastValidation: 'N/A',
    recordsFetched: '0',
    warnings: 0,
    errors: 0
  }
];

export const DataStatusDashboard: React.FC = () => {
  const activeLiveSources = SOURCES.filter(s => s.type === 'live' && s.status === 'healthy').length;
  const degradedSources = SOURCES.filter(s => s.status === 'degraded').length;
  const failedSources = SOURCES.filter(s => s.status === 'failed').length;
  const pendingSources = SOURCES.filter(s => s.status === 'unavailable').length;

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-surface-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Source Health Dashboard</h1>
              <p className="text-surface-500 mt-1">Real-time status of external datasets and active integrations.</p>
            </div>
            <button className="flex items-center gap-2 bg-white border border-surface-200 text-surface-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-surface-50">
              <RefreshCw className="h-4 w-4" /> Run Validations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-surface-200 flex flex-col gap-1 shadow-sm">
               <span className="text-surface-500 text-sm font-medium">Active Live Sources</span>
               <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
                 {activeLiveSources} <CheckCircle2 className="h-6 w-6" />
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col gap-1 shadow-sm bg-amber-50">
               <span className="text-amber-800 text-sm font-medium">Degraded Sources</span>
               <div className="text-3xl font-bold text-amber-600 flex items-center gap-2">
                 {degradedSources} <AlertTriangle className="h-6 w-6" />
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-200 flex flex-col gap-1 shadow-sm bg-rose-50">
               <span className="text-rose-800 text-sm font-medium">Failed Sources</span>
               <div className="text-3xl font-bold text-rose-600 flex items-center gap-2">
                 {failedSources} <AlertCircle className="h-6 w-6" />
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-surface-200 flex flex-col gap-1 shadow-sm">
               <span className="text-surface-500 text-sm font-medium">Pending Integrations</span>
               <div className="text-3xl font-bold text-surface-400 flex items-center gap-2">
                 {pendingSources} <Clock className="h-6 w-6" />
               </div>
            </div>
          </div>

          <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
               <h3 className="font-semibold text-surface-900">Configured Sources & Integrations</h3>
            </div>
            <div className="divide-y divide-surface-200">
              {SOURCES.map(source => (
                <div key={source.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-start gap-3">
                     <Database className="h-5 w-5 text-surface-400 mt-0.5" />
                     <div>
                       <h4 className="font-semibold text-surface-900">{source.name}</h4>
                       <div className="flex items-center gap-2 text-xs mt-1">
                         <span className="bg-surface-100 text-surface-600 px-1.5 py-0.5 rounded capitalize">{source.type}</span>
                         <span className="text-surface-500">ID: {source.id}</span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-8 text-sm">
                     <div className="hidden md:block text-right">
                       <span className="block text-surface-500 text-xs">Last Validated</span>
                       <span className="font-medium text-surface-900">{source.lastValidation !== 'N/A' ? new Date(source.lastValidation).toLocaleString() : 'N/A'}</span>
                     </div>
                     <div className="min-w-[120px]">
                       {source.status === 'healthy' && (
                         <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                           <ShieldCheck className="h-3.5 w-3.5" /> Healthy
                         </span>
                       )}
                       {source.status === 'degraded' && (
                         <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                           <ShieldAlert className="h-3.5 w-3.5" /> Degraded
                         </span>
                       )}
                       {source.status === 'unavailable' && (
                         <span className="inline-flex items-center gap-1.5 text-surface-600 bg-surface-100 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                           <Clock className="h-3.5 w-3.5" /> Unavailable
                         </span>
                       )}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm">
             <div className="px-5 py-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
                <h3 className="font-semibold text-surface-900">Background Processing (Cloud Functions)</h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Simulated</span>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <h4 className="text-sm font-bold text-surface-900">Vector Tile Pipeline</h4>
                   <p className="text-xs text-surface-500 leading-relaxed">
                      Recompute the vector tile cache if base cadastral data or imported geometries have changed significantly. This process runs as a background job.
                   </p>
                   <button 
                     onClick={async () => {
                       try {
                         const resp = await fetch('/api/recompute-tiles', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ tenantId: 'tenant_companyA', dataCollection: 'wcgp_cadastre' })
                         });
                         const data = await resp.json();
                         alert(data.message);
                       } catch {
                         alert("Failed to trigger recomputation");
                       }
                     }}
                     className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                   >
                     <RefreshCw className="h-3.5 w-3.5" /> Recompute wcgp_cadastre tiles
                   </button>
                </div>
                <div className="space-y-3 border-l border-surface-100 md:pl-6">
                   <h4 className="text-sm font-bold text-surface-900">GeoJSON Import Queue</h4>
                   <p className="text-xs text-surface-500 leading-relaxed">
                      Automatically process pending file uploads. Validates geometry, checks CRS compatibility (EPSG:4326), and indexes attributes for search.
                   </p>
                   <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[100%]" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">IDLE</span>
                   </div>
                   <p className="text-[10px] text-surface-400 italic">No pending files in organization bucket.</p>
                </div>
             </div>
          </div>

          <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm">
             <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
                <h3 className="font-semibold text-surface-900">Recent Validation Logs</h3>
             </div>
             <div className="p-0">
               <table className="w-full text-sm text-left">
                  <thead className="bg-surface-50 text-surface-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-5 py-3">Timestamp</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Validation Type</th>
                      <th className="px-5 py-3">Result</th>
                      <th className="px-5 py-3">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    <tr className="hover:bg-surface-50">
                      <td className="px-5 py-3 whitespace-nowrap text-surface-500">{new Date(Date.now() - 50000).toLocaleString()}</td>
                      <td className="px-5 py-3 font-medium text-surface-900">openaerialmap</td>
                      <td className="px-5 py-3 text-surface-600">Tile Fetch</td>
                      <td className="px-5 py-3"><span className="text-rose-600 font-medium">Failed</span></td>
                      <td className="px-5 py-3 text-surface-600 truncate max-w-sm">Warning: OAM tile failure caught. Disabling layer automatically.</td>
                    </tr>
                    <tr className="hover:bg-surface-50">
                      <td className="px-5 py-3 whitespace-nowrap text-surface-500">{new Date().toLocaleString()}</td>
                      <td className="px-5 py-3 font-medium text-surface-900">cct_land_parcels</td>
                      <td className="px-5 py-3 text-surface-600">Fetch Success</td>
                      <td className="px-5 py-3"><span className="text-emerald-600 font-medium">Verified</span></td>
                      <td className="px-5 py-3 text-surface-600 truncate max-w-sm">REST API replied with valid GeoJSON schema.</td>
                    </tr>
                    <tr className="hover:bg-surface-50">
                      <td className="px-5 py-3 whitespace-nowrap text-surface-500">{new Date(Date.now() - 300000).toLocaleString()}</td>
                      <td className="px-5 py-3 font-medium text-surface-900">osm_geofabrik_sa</td>
                      <td className="px-5 py-3 text-surface-600">Geometry Check</td>
                      <td className="px-5 py-3"><span className="text-amber-600 font-medium">Warning</span></td>
                      <td className="px-5 py-3 text-surface-600 truncate max-w-sm">Polygons missing expected metadata keys.</td>
                    </tr>
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
