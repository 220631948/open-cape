

;

/**
 * Seeds initial tenant and user data for demonstration purposes.
 * This simulates a "City of Cape Town Analyst Team" tenant.
 */
export async function seedTenantData() {
  console.log('--- Starting System Re-Seeding (from backend) ---');

  const res = await fetch('/api/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Seed failed');
  }

  console.log('--- Seeding Complete! ---');
  console.log('Use the following credentials:');
  console.table(data.users.map((u: any) => ({
    email: u.email,
    password: u.password,
    role: u.claims.role,
    tenantId: u.claims.tenantId || 'None'
  })));
  
  // Return the data so we can optionally show it in UI
  return data;
}
