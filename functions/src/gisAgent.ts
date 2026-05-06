import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const gisAgent = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { query, userId, phase } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  const reportRef = db.collection('gis_reports').doc();
  await reportRef.set({
    status: 'pending',
    query,
    userId: userId || 'anonymous',
    phase: phase || 'analysis',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.json({ reportId: reportRef.id });

  // Process asynchronously
  (async () => {
    try {
      await reportRef.update({ status: 'processing' });
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent(`Act as a GIS assistant. Analyze this query: "${query}" from user ${userId}. Provide spatial recommendations.`);
      const response = await result.response;
      const text = response.text();

      await reportRef.update({
        status: 'complete',
        result: text,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (err: any) {
      console.error('GIS Agent Error:', err);
      await reportRef.update({
        status: 'error',
        error: err.message,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  })();
});
