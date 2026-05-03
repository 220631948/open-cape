// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as admin from 'firebase-admin';

// Note: In a real Firebase Functions environment, we would use the firebase-admin SDK.
// Since this is deployed independently, we assume admin is initialized in gisAgent.ts.

export async function runPhase1(userId: string, bbox: [number, number, number, number], stateRef: admin.firestore.DocumentReference) {
  // Phase 1 - Rental Estimation
  // 1. Fetch data
  // 2. Compute analytics
  // 3. Write Firestore
  
  const analyticsRef = admin.firestore().doc(`analytics/${userId}/rent`);
  await analyticsRef.set({
    estimated_rent: 12000,
    rent_confidence_score: 0.85,
    rent_method: 'comparables',
    rent_timestamp: admin.firestore.FieldValue.serverTimestamp(),
    bbox
  }, { merge: true });

  // 4. Update state
  await stateRef.update({
    currentPhase: 1,
    status: "waiting_validation",
    lastUpdated: Date.now()
  });

  return { phase: 1, status: "pending_validation" };
}

export async function runPhase2(userId: string, bbox: [number, number, number, number], stateRef: admin.firestore.DocumentReference) {
  // Phase 2 - Risk
  const analyticsRef = admin.firestore().doc(`analytics/${userId}/risk`);
  await analyticsRef.set({
    risk_score: 45,
    risk_band: 'Medium',
    risk_subscores: { flood: 10, zoning: 20, compliance: 15 },
    risk_timestamp: admin.firestore.FieldValue.serverTimestamp(),
    bbox
  }, { merge: true });

  await stateRef.update({
    currentPhase: 2,
    status: "waiting_validation",
    lastUpdated: Date.now()
  });

  return { phase: 2, status: "pending_validation" };
}

export async function runPhase3(userId: string, bbox: [number, number, number, number], stateRef: admin.firestore.DocumentReference) {
  // Phase 3 - Segments
  const analyticsRef = admin.firestore().doc(`analytics/${userId}/segments`);
  await analyticsRef.set({
    market_segment: 'Emerging Professional',
    segment_confidence: 0.78,
    segment_timestamp: admin.firestore.FieldValue.serverTimestamp(),
    bbox
  }, { merge: true });

  await stateRef.update({
    currentPhase: 3,
    status: "waiting_validation",
    lastUpdated: Date.now()
  });

  return { phase: 3, status: "pending_validation" };
}

export async function runPhase4(userId: string, bbox: [number, number, number, number], stateRef: admin.firestore.DocumentReference) {
  // Phase 4 - Anomalies
  const analyticsRef = admin.firestore().doc(`analytics/${userId}/anomalies`);
  await analyticsRef.set({
    anomaly_score: 0.12,
    anomaly_severity: 'Low',
    anomaly_reason: 'None detected',
    anomaly_timestamp: admin.firestore.FieldValue.serverTimestamp(),
    bbox
  }, { merge: true });

  await stateRef.update({
    currentPhase: 4,
    status: "waiting_validation",
    lastUpdated: Date.now()
  });

  return { phase: 4, status: "pending_validation" };
}

export async function runPhase5(userId: string, bbox: [number, number, number, number], stateRef: admin.firestore.DocumentReference) {
  // Phase 5 - Forecast
  const analyticsRef = admin.firestore().doc(`analytics/${userId}/forecast`);
  await analyticsRef.set({
    forecast_value: 2000000,
    forecast_confidence: 0.82,
    forecast_horizon: '5 years',
    trend_direction: 'up',
    forecast_timestamp: admin.firestore.FieldValue.serverTimestamp(),
    bbox
  }, { merge: true });

  await stateRef.update({
    currentPhase: 5,
    status: "waiting_validation",
    lastUpdated: Date.now()
  });

  return { phase: 5, status: "pending_validation" };
}
