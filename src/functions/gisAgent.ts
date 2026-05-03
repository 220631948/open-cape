// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { AgentState } from "../types/agent";
import { runPhase1, runPhase2, runPhase3, runPhase4, runPhase5 } from "./phases";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const gisAgent = onCall(async (req) => {
  const { userId, bbox, phase } = req.data;

  // Basic validation
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  if (req.auth.uid !== userId) {
    throw new HttpsError('permission-denied', 'Cannot run agent for another user.');
  }
  if (!bbox || !Array.isArray(bbox) || bbox.length !== 4) {
    throw new HttpsError('invalid-argument', 'Valid bbox array is required.');
  }

  const db = admin.firestore();
  const stateRef = db.doc(`agentState/${userId}`);
  
  try {
    const stateSnap = await stateRef.get();
    const state = stateSnap.data() as AgentState | undefined;

    if (!state) {
      // Initialize state if not present
      await stateRef.set({
        userId,
        currentPhase: 1,
        status: "running",
        bbox,
        lastUpdated: Date.now()
      });
    } else {
      // Validate that we only advance if waiting or running
      if (state.status === "failed") {
          throw new HttpsError('failed-precondition', 'Agent is in a failed state. Needs intervention.');
      }
    }

    const targetPhase = phase ?? state?.currentPhase ?? 1;

    // Phase router
    switch (targetPhase) {
      case 1:
        return await runPhase1(userId, bbox as [number, number, number, number], stateRef);
      case 2:
        return await runPhase2(userId, bbox as [number, number, number, number], stateRef);
      case 3:
        return await runPhase3(userId, bbox as [number, number, number, number], stateRef);
      case 4:
        return await runPhase4(userId, bbox as [number, number, number, number], stateRef);
      case 5:
        return await runPhase5(userId, bbox as [number, number, number, number], stateRef);
      default:
        throw new HttpsError('invalid-argument', 'Invalid phase requested');
    }
  } catch (err: any) {
    console.error("GIS Agent Error:", err);
    await stateRef.update({
        status: "failed",
        lastUpdated: Date.now()
    });
    throw new HttpsError('internal', err.message || 'Error executing agent phase');
  }
});
