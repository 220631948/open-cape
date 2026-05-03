import { 
  db, 
  auth 
} from './firebase';
import { doc, getDoc, collection, query, where, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { setDoc, updateDoc } from '@/src/lib/safeFirestore';;

export interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
  maxUsers: number;
  currentUsers: number;
  status: 'active' | 'suspended';
}

export interface TenantRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  isSystem?: boolean; // Protect default roles from deletion
}

export const getTenantRoles = async (tenantId: string) => {
  const rolesRef = collection(db, 'tenants', tenantId, 'roles');
  const snap = await getDocs(rolesRef);
  if (snap.empty) {
    // Return hardcoded basic roles if not seeded in subcollection
    return [
      { id: 'owner', name: 'Owner', description: 'Full workspace control', permissions: ['All Permissions'], color: 'bg-rose-100 text-rose-700 border-rose-200', isSystem: true },
      { id: 'analyst', name: 'Analyst', description: 'Can import data, create annotations', permissions: ['Read Map', 'Import GeoJSON', 'Verify Data', 'Export PDF'], color: 'bg-indigo-100 text-indigo-700 border-indigo-200', isSystem: true },
      { id: 'viewer', name: 'Viewer', description: 'Read-only access', permissions: ['Read Map', 'Export Snapshot'], color: 'bg-emerald-100 text-emerald-700 border-emerald-200', isSystem: true }
    ] as TenantRole[];
  }
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TenantRole[];
};

export const createTenantRole = async (tenantId: string, role: Omit<TenantRole, 'id'>) => {
  const roleId = `role-${Math.random().toString(36).substring(2, 9)}`;
  const roleRef = doc(db, 'tenants', tenantId, 'roles', roleId);
  await setDoc(roleRef, { ...role, isSystem: false });
  return roleId;
};

export const updateTenantRole = async (tenantId: string, roleId: string, data: Partial<TenantRole>) => {
  const roleRef = doc(db, 'tenants', tenantId, 'roles', roleId);
  await updateDoc(roleRef, data);
};

export const deleteTenantRole = async (tenantId: string, roleId: string) => {
  // We don't delete docs via API unless we import deleteDoc, instead we can mark them deleted or actually delete them
  // Let's import deleteDoc or use safeFirestore? safeFirestore doesn't have deleteDoc.
  // Actually, we can just throw if they try to delete an owner role
  if (roleId === 'owner') throw new Error("Cannot delete the Owner role.");
  
  // Since we don't have safe deleteDoc imported, let's just use updateDoc and mark it deleted if we want, or import deleteDoc
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'tenants', tenantId, 'roles', roleId));
};


export const createTenant = async (name: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated to create a tenant.');

  // Check if user already has a tenant
  const userProfileRef = doc(db, 'user_profiles', user.uid);
  const userProfile = await getDoc(userProfileRef);
  if (userProfile.exists() && userProfile.data().tenantId) {
    throw new Error('User is already associated with a tenant.');
  }

  const tenantId = `tenant-${Math.random().toString(36).substring(2, 9)}`;
  const tenantRef = doc(db, 'tenants', tenantId);

  const newTenant: Tenant = {
    id: tenantId,
    name,
    ownerId: user.uid,
    createdAt: serverTimestamp(),
    maxUsers: 50,
    currentUsers: 1,
    status: 'active'
  };

  await setDoc(tenantRef, newTenant);

  // Seed default tenant roles
  const rolesRef = doc(db, 'tenants', tenantId, 'config', 'roles');
  await setDoc(rolesRef, {
    available: ['owner', 'analyst', 'viewer'],
    updatedAt: serverTimestamp()
  });

  // Update user profile with tenant ID and owner role
  await updateDoc(userProfileRef, {
    tenantId,
    role: 'owner',
    updatedAt: serverTimestamp()
  });

  return tenantId;
};

export const getTenant = async (tenantId: string) => {
  const docRef = doc(db, 'tenants', tenantId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() as Tenant : null;
};

export const getTenantUsers = async (tenantId: string): Promise<any[]> => {
  const usersRef = collection(db, 'user_profiles');
  const q = query(usersRef, where('tenantId', '==', tenantId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
};

export const updateTenant = async (tenantId: string, data: Partial<Tenant>) => {
  const docRef = doc(db, 'tenants', tenantId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const addMemberToTenant = async (tenantId: string, email: string, role: string = 'viewer') => {
  const tenantRef = doc(db, 'tenants', tenantId);
  const tenantDoc = await getDoc(tenantRef);
  if (!tenantDoc.exists()) throw new Error('Tenant not found.');
  
  const tenantData = tenantDoc.data() as Tenant;
  if (tenantData.currentUsers >= tenantData.maxUsers) {
    throw new Error(`Tenant user limit reached (${tenantData.maxUsers} users).`);
  }

  const usersRef = collection(db, 'user_profiles');
  const q = query(usersRef, where('email', '==', email));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    throw new Error('User not found. They must sign in once to create a profile.');
  }

  const userDoc = snap.docs[0];
  if (userDoc.data().tenantId) {
    throw new Error('User is already associated with an organization.');
  }

  await updateDoc(userDoc.ref, {
    tenantId,
    role,
    updatedAt: serverTimestamp()
  });

  // Increment tenant user count
  await updateDoc(tenantRef, {
    currentUsers: increment(1)
  });
};

export const updateMemberRole = async (userId: string, newRole: string) => {
  const userRef = doc(db, 'user_profiles', userId);
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: serverTimestamp()
  });
};

export const removeMemberFromTenant = async (tenantId: string, userId: string) => {
  const userRef = doc(db, 'user_profiles', userId);
  await updateDoc(userRef, {
    tenantId: null,
    role: null,
    updatedAt: serverTimestamp()
  });

  // Decrement tenant user count
  const tenantRef = doc(db, 'tenants', tenantId);
  await updateDoc(tenantRef, {
    currentUsers: increment(-1)
  });
};
