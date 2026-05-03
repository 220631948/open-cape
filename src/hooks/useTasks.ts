import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { setDoc, updateDoc } from '../lib/safeFirestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Task {
  id: string;
  ownerUid: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  parentId?: string;
  order: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'tasks'),
        where('ownerUid', '==', user.uid)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      
      // Sort by order as primary
      data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (
    title: string, 
    description?: string, 
    options?: { priority?: 'low' | 'medium' | 'high', dueDate?: string, parentId?: string }
  ) => {
    if (!user) return;
    const id = crypto.randomUUID();
    
    // For order, we separate main tasks and subtasks for consistency
    const relevantTasks = tasks.filter(t => t.parentId === options?.parentId);
    const order = relevantTasks.length > 0 ? Math.max(...relevantTasks.map(t => t.order || 0)) + 1 : 0;
    
    const newTask: Task = {
      id,
      ownerUid: user.uid,
      title,
      description: description || '',
      status: 'todo',
      priority: options?.priority || 'medium',
      dueDate: options?.dueDate || '',
      parentId: options?.parentId || '',
      order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'tasks', id), newTask);
    await fetchTasks();
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    await updateDoc(doc(db, 'tasks', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    // optimistic
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const reorderTasks = async (orderedIds: string[]) => {
    if (!user) return;
    setTasks(prev => {
      const copy = [...prev];
      copy.sort((a, b) => {
        const indexA = orderedIds.indexOf(a.id);
        const indexB = orderedIds.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      return copy.map((t, i) => ({ ...t, order: i }));
    });

    try {
      await Promise.all(
        orderedIds.map((id, index) => 
          updateDoc(doc(db, 'tasks', id), { order: index, updatedAt: serverTimestamp() })
        )
      );
    } catch (err) {
      console.error('Failed to reorder:', err);
      await fetchTasks();
    }
  };

  return { tasks, isLoading, createTask, updateTask, deleteTask, reorderTasks };
}
