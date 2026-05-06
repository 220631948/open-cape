import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Map, Bookmark as BookmarkIcon, Link as LinkIcon, Trash2, Settings, ShieldCheck, Pencil, MessageSquare, Camera, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button, Skeleton, Card, DataStatusBanner } from '@/components/ui';
import { useProjects, SavedProject } from '@/hooks/useProjects';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDrawings } from '@/hooks/useDrawings';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useProjectEvidence } from '@/hooks/useProjectEvidence';
import { useStorage } from '@/hooks/useStorage';

export const ProjectDetailPage = () => {
   const { projectId } = useParams<{ projectId: string }>();
   const navigate = useNavigate();
   const { projects, isLoading, fetchProjects, deleteProject } = useProjects();
   const { bookmarks, isLoading: isLoadingBookmarks } = useBookmarks(projectId);
   const { drawings, isLoading: isLoadingDrawings } = useDrawings(projectId);
   const { annotations, isLoading: isLoadingAnnotations } = useAnnotations(projectId);
   const { evidence, isLoading: isLoadingEvidence, addEvidence } = useProjectEvidence(projectId);
   const { uploadImage, isUploading } = useStorage();

   const [project, setProject] = useState<SavedProject | null>(null);

   useEffect(() => {
      if (projects.length > 0 && projectId) {
         setProject(projects.find(p => p.id === projectId) || null);
      }
   }, [projects, projectId]);

   if (isLoading) {
      return (
         <div className="p-8 max-w-5xl mx-auto space-y-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
         </div>
      );
   }

   if (!project) {
      return (
         <div className="p-8 flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <Button onClick={() => navigate('/app/projects')} variant="secondary">Go back to projects</Button>
         </div>
      );
   }

   return (
      <div className="flex flex-col h-full bg-surface-50 overflow-y-auto">
         {/* Detail Header */}
         <div className="bg-white border-b border-surface-200 shrink-0 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-6 py-6 border-b border-surface-100 flex items-start gap-4">
               <Button variant="ghost" size="icon" onClick={() => navigate('/app/projects')} className="mt-1 text-surface-400 hover:text-surface-900 shrink-0">
                  <ArrowLeft className="h-5 w-5" />
               </Button>
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                     <h1 className="text-2xl font-semibold text-surface-900 tracking-tight">{project.title}</h1>
                     <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 bg-surface-100 px-2 py-0.5 rounded border border-surface-200">
                        {project.privacy}
                     </span>
                  </div>
                  <p className="text-surface-500 text-sm">{project.description || 'No description provided.'}</p>
               </div>
               <div className="flex gap-2 shrink-0">
                  <Button variant="outline" className="text-surface-600">
                     <Settings className="h-4 w-4 mr-2" />
                     Edit
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => {
                     deleteProject(project.id);
                     navigate('/app/projects');
                  }}>
                     <Trash2 className="h-4 w-4 mr-2" />
                     Delete
                  </Button>
               </div>
            </div>
         </div>

         <div className="max-w-5xl mx-auto px-6 py-8 w-full flex flex-col md:flex-row gap-8">
            
            {/* Left Column: Content */}
            <div className="flex-1 space-y-8 min-w-0">
               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                        <Map className="h-5 w-5 text-surface-400" />
                        Linked Maps
                     </h2>
                     <Button variant="outline" size="sm" className="text-xs">
                        <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                        Link Map
                     </Button>
                  </div>
                  
                  {project.linkedSavedMapIds.length === 0 ? (
                     <div className="bg-white border-2 border-dashed border-surface-200 rounded-xl p-8 text-center">
                        <p className="text-surface-500 font-medium mb-1">No saved maps linked yet.</p>
                        <p className="text-surface-400 text-sm">Attach an existing saved map to start building this project.</p>
                     </div>
                  ) : (
                     <div className="grid gap-4">
                        {project.linkedSavedMapIds.map(mapId => (
                           <Card key={mapId} className="p-4 flex items-center gap-4">
                              <div className="h-12 w-12 bg-surface-100 rounded flex items-center justify-center shrink-0">
                                 <Map className="h-6 w-6 text-surface-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-medium text-surface-900 truncate">Saved Map Reference</h4>
                                 <p className="text-xs text-surface-500 font-mono mt-0.5">{mapId}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-surface-400 hover:text-red-600">Unlink</Button>
                           </Card>
                        ))}
                     </div>
                  )}
               </section>

               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                        <BookmarkIcon className="h-5 w-5 text-surface-400" />
                        Bookmarks
                     </h2>
                     <Link to="/app/map">
                        <Button variant="outline" size="sm" className="text-xs">
                           Go to Map
                        </Button>
                     </Link>
                  </div>
                  
                  {isLoadingBookmarks ? (
                     <Skeleton className="h-24 w-full" />
                  ) : bookmarks.length === 0 ? (
                     <div className="bg-white border text-center border-surface-200 rounded-xl p-8">
                        <p className="text-surface-500 mb-2">No bookmarks specifically saved to this project.</p>
                        <DataStatusBanner variant="warning" className="inline-flex text-left max-w-sm mt-2" />
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {bookmarks.map(bk => (
                           <Card key={bk.id} className="p-4 flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                 <h4 className="font-semibold text-surface-900 line-clamp-1">{bk.label}</h4>
                                 <span className="text-[10px] uppercase font-bold text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">{bk.type}</span>
                              </div>
                              {bk.notes && <p className="text-xs text-surface-500 line-clamp-2">{bk.notes}</p>}
                              
                              {/* Source representation */}
                              <div className="mt-auto pt-2 flex items-center justify-between">
                                 {bk.sourceRefs && bk.sourceRefs.length > 0 ? (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                       <ShieldCheck className="h-3 w-3" />
                                       {bk.sourceRefs.length} Verified {bk.sourceRefs.length === 1 ? 'Source' : 'Sources'}
                                    </div>
                                 ) : (
                                    <div className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">No verified source</div>
                                 )}
                                 <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-surface-500 hover:text-surface-900">View</Button>
                              </div>
                           </Card>
                        ))}
                     </div>
                  )}
               </section>

               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                        <Pencil className="h-5 w-5 text-surface-400" />
                        Drawings
                     </h2>
                     <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/app/map')}>
                        Draw on Map
                     </Button>
                  </div>
                  
                  {isLoadingDrawings ? (
                     <Skeleton className="h-24 w-full" />
                  ) : drawings.length === 0 ? (
                     <div className="bg-white border text-center border-surface-200 rounded-xl p-6">
                        <p className="text-surface-500 text-sm italic">No custom drawings attached to this project.</p>
                     </div>
                  ) : (
                     <div className="grid gap-3">
                        {drawings.map(d => (
                           <Card key={d.id} className="p-3 flex items-center justify-between hover:border-surface-300 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-surface-50 rounded border border-surface-100">
                                    <Pencil className="h-4 w-4 text-surface-400" />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-semibold text-surface-900">{d.title}</h4>
                                    <p className="text-[10px] text-surface-500 uppercase font-bold tracking-tight">{d.geometryType}</p>
                                 </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase" onClick={() => navigate('/app/map', { state: { focusDrawing: d } })}>View</Button>
                           </Card>
                        ))}
                     </div>
                  )}
               </section>

               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-surface-400" />
                        Annotations
                     </h2>
                  </div>
                  
                  {isLoadingAnnotations ? (
                     <Skeleton className="h-24 w-full" />
                  ) : annotations.length === 0 ? (
                     <div className="bg-white border text-center border-surface-200 rounded-xl p-6">
                        <p className="text-surface-500 text-sm italic">No annotations found for this project.</p>
                     </div>
                  ) : (
                     <div className="grid gap-3">
                        {annotations.map(a => (
                           <Card key={a.id} className="p-3 hover:border-surface-300 transition-all">
                              <div className="flex items-center gap-2 mb-1.5 text-[9px] uppercase font-bold text-surface-400 tracking-wider">
                                 <MessageSquare className="h-2.5 w-2.5" />
                                 {a.targetType} note
                              </div>
                              <h4 className="text-sm font-semibold text-surface-900 mb-1">{a.title}</h4>
                              <p className="text-xs text-surface-600 line-clamp-2">{a.body}</p>
                           </Card>
                        ))}
                     </div>
                  )}
               </section>

               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-surface-400" />
                        Field Evidence
                     </h2>
                     <div className="flex items-center gap-2">
                       <input
                         type="file"
                         id="evidence-upload"
                         className="hidden"
                         accept="image/*"
                         onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (file && projectId) {
                             const url = await uploadImage(file, `projects/${projectId}/evidence`);
                             if (url) {
                               await addEvidence({
                                 type: 'image',
                                 url,
                                 caption: file.name
                               });
                             }
                           }
                         }}
                       />
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="text-xs"
                         onClick={() => document.getElementById('evidence-upload')?.click()}
                         disabled={isUploading}
                       >
                          {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                          Upload Photo
                       </Button>
                     </div>
                  </div>
                  
                  {isLoadingEvidence ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       {[1, 2, 3].map(i => <Skeleton key={i} className="aspect-square w-full rounded-xl" />)}
                     </div>
                  ) : evidence.length === 0 ? (
                     <div className="bg-white border text-center border-surface-200 rounded-xl p-8">
                        <div className="h-12 w-12 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ImageIcon className="h-6 w-6 text-surface-300" />
                        </div>
                        <p className="text-surface-500 font-medium mb-1">No field evidence yet.</p>
                        <p className="text-surface-400 text-xs">Collect photographic evidence from recent site visits.</p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {evidence.map(item => (
                           <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border border-surface-200 bg-surface-100 shadow-sm transition-all hover:shadow-md">
                              <img 
                                src={item.url} 
                                alt={item.caption} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                 <p className="text-white text-[10px] font-bold uppercase tracking-wider truncate">{item.caption}</p>
                                 <p className="text-white/70 text-[9px]">{item.createdAt?.toDate().toLocaleDateString()}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </section>
            </div>

            {/* Right Column: Metadata */}
            <div className="w-full md:w-64 shrink-0 space-y-6">
               <Card className="p-4 space-y-4 shadow-sm border-surface-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Metadata</h3>
                  <div className="space-y-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wide">Status</span>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-surface-900">
                           <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active
                        </div>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wide">Sources</span>
                        {project.sourceRefs && project.sourceRefs.length > 0 ? (
                           <span className="text-sm text-surface-900">{project.sourceRefs.length} Verified</span>
                        ) : (
                           <span className="text-sm text-surface-500 italic">None attached</span>
                        )}
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wide">Bookmarks</span>
                        <span className="text-sm text-surface-900">{bookmarks.length} saved</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wide">Drawings</span>
                        <span className="text-sm text-surface-900">{drawings.length} shapes</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wide">Notes</span>
                        <span className="text-sm text-surface-900">{annotations.length} entries</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wide">Created</span>
                        <span className="text-sm text-surface-900">{project.createdAt?.toDate().toLocaleDateString() || 'Recently'}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wide">Last Updated</span>
                        <span className="text-sm text-surface-900">{project.updatedAt?.toDate().toLocaleDateString() || 'Recently'}</span>
                     </div>
                  </div>
               </Card>
               
               <DataStatusBanner variant="warning" />
            </div>
         </div>
      </div>
   );
};
