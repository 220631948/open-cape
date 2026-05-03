import { 
  db 
} from '../lib/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDoc } from '@/src/lib/safeFirestore';;

/**
 * Seeds initial tenant and user data for demonstration purposes.
 * This simulates a "City of Cape Town Analyst Team" tenant.
 */
export async function seedTenantData() {
  const TENANT_ID = 'tenant-cape-prospects-001';
  const OWNER_ID = 'owner-analyst-alpha';
  
  console.log('--- Starting Tenant Seeding ---');

  // 1. Create Tenant
  const tenantRef = doc(db, 'tenants', TENANT_ID);
  await setDoc(tenantRef, {
    id: TENANT_ID,
    name: 'Cape Prospects',
    ownerId: OWNER_ID,
    createdAt: serverTimestamp(),
    maxUsers: 50,
    currentUsers: 3,
    status: 'active'
  });
  console.log(`[1/3] Seeded Tenant: ${TENANT_ID}`);

  // 2. Seed Tenant Users (Profiles)
  const users = [
    {
      uid: OWNER_ID,
      fullName: 'Ralph Data-Bart',
      email: 'ralph@capetown.gov.za',
      tenantId: TENANT_ID,
      role: 'owner',
      title: 'Senior Spatial Engineer'
    },
    {
      uid: 'user-analyst-bravo',
      fullName: 'Sarah Mapper',
      email: 'sarah@capetown.gov.za',
      tenantId: TENANT_ID,
      role: 'analyst',
      title: 'Urban Planning Analyst'
    },
    {
      uid: 'user-analyst-charlie',
      fullName: 'Mark Surveyor',
      email: 'mark@capetown.gov.za',
      tenantId: TENANT_ID,
      role: 'viewer',
      title: 'Territory Manager'
    }
  ];

  for (const user of users) {
    const userRef = doc(db, 'user_profiles', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      fullName: user.fullName,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      title: user.title,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      preferences: {
        defaultMapCenter: { lat: -33.9249, lng: 18.4241 }
      }
    });
    console.log(` - Seeded User Profile: ${user.fullName} (${user.role})`);
  }
  console.log('[2/3] Seeded 3 User Profiles');

  // 3. Seed Tenant Default Roles (Configuration)
  // These are often just logical strings, but we can store metadata
  const rolesRef = doc(db, 'tenants', TENANT_ID, 'config', 'roles');
  await setDoc(rolesRef, {
    available: ['owner', 'analyst', 'viewer'],
    updatedAt: serverTimestamp()
  });
  console.log('[3/3] Seeded Tenant Role Config');

  console.log('--- Seeding Complete ---');
  return TENANT_ID;
}
