import { TransactionAnomalyResult, AnomalySeverity, AnomalyReason } from '../types/anomaly';

interface Transaction {
  date: string;
  price: number;
  type: string;
}

export function detectTransactionAnomalies(
  transactions: Transaction[],
  localComparableMedianPrice?: number
): TransactionAnomalyResult | null {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const timestamp = new Date().toISOString();
  let score = 0;
  const reasons: AnomalyReason[] = [];
  let confidence = 80;

  // Sort transactions by date ascending
  const sorted = [...transactions]
    .filter(t => !!t.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length < 2) {
     if (sorted.length === 1 && localComparableMedianPrice && sorted[0].price > 0) {
        // Just one transaction, check outlier
        const price = sorted[0].price;
        if (price > localComparableMedianPrice * 3) {
           score += 40;
           reasons.push({ code: 'PRICE_EXTREME_HIGH', description: 'Transaction price is significantly higher than local comparables.'});
        } else if (price < localComparableMedianPrice * 0.2) {
           score += 40;
           reasons.push({ code: 'PRICE_EXTREME_LOW', description: 'Transaction price is significantly lower than local market context.'});
        }
     }
     if (reasons.length === 0) return null; // No anomalies for single/zero transactions unless extreme
  }

  // Check rapid flips
  for (let i = 1; i < sorted.length; i++) {
    const t0 = sorted[i - 1];
    const t1 = sorted[i];

    const d0 = new Date(t0.date).getTime();
    const d1 = new Date(t1.date).getTime();
    const daysBetween = (d1 - d0) / (1000 * 60 * 60 * 24);

    if (daysBetween >= 0 && daysBetween < 180) { // Under 6 months
      score += 30;
      reasons.push({ code: 'RAPID_FLIP', description: `Multiple transfers detected within a short period (${Math.round(daysBetween)} days).`});
      
      // Check if price jumped suspiciously during rapid flip
      if (t0.price > 0 && t1.price > t0.price * 1.8) {
         score += 40;
         reasons.push({ code: 'RAPID_FLIP_MARKUP', description: `Value increased disproportionately during a rapid transfer sequence.`});
      }
    }

    if (t0.date === t1.date && t0.type !== t1.type) {
       score += 20;
       reasons.push({ code: 'SAME_DAY_MULTI_TRANSFER', description: 'Multiple conflicting or sequential record types on the same day.'});
    }
  }

  if (score === 0) return null;

  score = Math.min(score, 100);

  let severity: AnomalySeverity = 'Low';
  if (score >= 80) severity = 'Critical';
  else if (score >= 60) severity = 'High';
  else if (score >= 30) severity = 'Medium';

  // Lower confidence if missing local market data
  if (!localComparableMedianPrice) {
     confidence -= 20;
  }

  return {
    score,
    severity,
    reasons: getUniqueReasons(reasons),
    confidence,
    evaluatedAt: timestamp
  };
}

function getUniqueReasons(reasons: AnomalyReason[]): AnomalyReason[] {
  const seen = new Set<string>();
  return reasons.filter(r => {
    if (seen.has(r.code)) return false;
    seen.add(r.code);
    return true;
  });
}
