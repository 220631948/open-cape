import { OwnershipChangeEvent } from '../types/history';

export function detectOwnershipChange(transactions: any[], currentOwnerType?: string, currentOwnerCategory?: string): OwnershipChangeEvent | null {
  if (!transactions || transactions.length === 0) return null;
  
  // Sort oldest to newest to find changes, or newest to oldest. Let's do newest first.
  const sorted = transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // If the latest transaction has ownershipChange true or implies a change
  const latest = sorted[0];
  
  if (latest && (latest.ownershipChange || latest.type.includes('Transfer') || latest.type.includes('Sale'))) {
      
    // Try to find the second latest for previous owner details if available
    const previous = sorted[1];
    
    return {
      detected: true,
      newOwnerType: currentOwnerType || 'Unknown',
      newOwnerCategory: currentOwnerCategory || 'Unknown',
      previousOwnerType: previous ? previous.ownerType || 'Unknown' : 'Unknown',
      previousOwnerCategory: previous ? previous.ownerCategory || 'Unknown' : 'Unknown',
      transferDate: latest.date,
      eventType: latest.type as any
    };
  }

  return null;
}
