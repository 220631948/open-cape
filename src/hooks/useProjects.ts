import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { setDoc, updateDoc } from '@/src/lib/safeFirestore';;
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface SavedProject {
  id: string;
  ownerUid: string;
  title: string;
  description: string;
  privacy: 'private' | 'shared' | 'public';
  status: 'active' | 'archived';
  tags: string[];
  pinnedMapId?: string;
  linkedSavedMapIds: string[];
  bookmarkIds: string[];
  sourceRefs: string[];
  createdAt: any;
  updatedAt: any;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'saved_projects'),
        where('ownerUid', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedProject)));
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      // Fallback if index does not exist yet (requires composite index for auth.uid + updatedAt)
      if (err.message.includes('index')) {
         try {
           const fallbackQ = query(
             collection(db, 'saved_projects'),
             where('ownerUid', '==', user.uid)
           );
           const fallbackSnap = await getDocs(fallbackQ);
           const data = fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedProject));
           data.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
           setProjects(data);
         } catch (fallbackErr: any) {
            setError(fallbackErr.message || 'Failed to load projects.');
         }
      } else {
        setError(err.message || 'Failed to load projects.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (title: string, description: string = '') => {
    if (!user) throw new Error("Must be logged in.");
    const id = crypto.randomUUID();
    const newProject: SavedProject = {
      id,
      ownerUid: user.uid,
      title,
      description,
      privacy: 'private',
      status: 'active',
      tags: [],
      linkedSavedMapIds: [],
      bookmarkIds: [],
      sourceRefs: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'saved_projects', id), newProject);
    await fetchProjects();
    return id;
  };

  const updateProject = async (id: string, updates: Partial<SavedProject>) => {
    if (!user) return;
    await updateDoc(doc(db, 'saved_projects', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    await fetchProjects();
  };

  const deleteProject = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'saved_projects', id));
    await fetchProjects();
  };

  const linkSavedMap = async (projectId: string, mapId: string) => {
     if (!user) return;
     const project = projects.find(p => p.id === projectId);
     if (project && !project.linkedSavedMapIds.includes(mapId)) {
        await updateProject(projectId, { linkedSavedMapIds: [...project.linkedSavedMapIds, mapId]});
     }
  };

  const unlinkSavedMap = async (projectId: string, mapId: string) => {
     if (!user) return;
     const project = projects.find(p => p.id === projectId);
     if (project && project.linkedSavedMapIds.includes(mapId)) {
        await updateProject(projectId, { linkedSavedMapIds: project.linkedSavedMapIds.filter(id => id !== mapId)});
     }
  };

  return { projects, isLoading, error, fetchProjects, createProject, updateProject, deleteProject, linkSavedMap, unlinkSavedMap };
}
