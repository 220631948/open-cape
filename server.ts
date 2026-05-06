import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';

let firebaseConfig: any;
try {
  const fileContent = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
  firebaseConfig = JSON.parse(fileContent);
} catch (e) {
  console.log("No firebase-applet-config.json found");
}

let adminApp: admin.app.App | null = null;
let db: FirebaseFirestore.Firestore | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
     try {
       const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().startsWith('{') 
         ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
         : JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'));
       
       adminApp = admin.initializeApp({
         credential: admin.credential.cert(serviceAccount),
         projectId: firebaseConfig?.projectId
       });
       console.log("Initialized Firebase Admin via Service Account");
     } catch (keyErr) {
       console.warn("FIREBASE_SERVICE_ACCOUNT_KEY was provided but could not be parsed. Falling back to ADC.");
       adminApp = admin.initializeApp({
         projectId: firebaseConfig?.projectId
       });
       console.log("Initialized Firebase Admin via ADC (fallback)");
     }
  } else if (firebaseConfig?.projectId) {
     // Try ADC
     adminApp = admin.initializeApp({
       projectId: firebaseConfig?.projectId
     });
     console.log("Initialized Firebase Admin via ADC");
  }
  
  if (adminApp && firebaseConfig?.firestoreDatabaseId) {
    db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
  } else if (adminApp) {
    db = getFirestore(adminApp);
  }
} catch (e) {
  console.error("Failed to initialize Firebase Admin:", e);
}


import { rateLimit } from 'express-rate-limit';

const impersonateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: "Too many impersonation requests, please try again later." }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Detailed environment logging for Cloud Run diagnosis
  console.log(`[INIT] Starting server in mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INIT] Current working directory: ${process.cwd()}`);
  console.log(`[INIT] dist exists: ${fs.existsSync(path.join(process.cwd(), 'dist'))}`);
  console.log(`[INIT] GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
  if (process.env.GEMINI_API_KEY) {
    console.log(`[INIT] GEMINI_API_KEY starts with: ${process.env.GEMINI_API_KEY.substring(0, 4)}...`);
  }

  // API Routes
  
  app.post('/api/process-geojson', async (req, res) => {
    if (!adminApp || !db) return res.status(500).json({error: 'Firebase Admin not initialized'});
    const { layerId, geojson, tenantId } = req.body;
    
    if (!layerId || !geojson) return res.status(400).json({error: "Missing required fields"});

    try {
      console.log(`Processing GeoJSON for layer ${layerId}...`);
      // Simulate heavy processing/validation
      const featureCount = geojson.features?.length || 0;
      
      // Update status in Firestore
      const layerRef = db.collection('imported_geojson').doc(layerId);
      await layerRef.update({
        status: 'processed',
        featureCount,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json({ success: true, message: `Successfully processed ${featureCount} features.` });
    } catch (err: any) {
      console.error("GEOJSON_PROCESS_ERROR", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/recompute-tiles', async (req, res) => {
    if (!adminApp || !db) return res.status(500).json({error: 'Firebase Admin not initialized'});
    const { tenantId, dataCollection } = req.body;

    try {
      console.log(`Triggering vector tile recomputation for ${dataCollection} in tenant ${tenantId}...`);
      // In a real environment, this would call tippecanoe or a tile server API
      // Here we just simulate success
      setTimeout(async () => {
        if (db) {
          await db.collection('system_events').add({
            type: 'TILE_RECOMPUTED',
            collection: dataCollection,
            tenantId,
            status: 'completed',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }, 2000);

      res.json({ success: true, message: "Tile recomputation triggered successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/search', async (req, res) => {
    const query = req.query.q as string || '';
    const tenantId = req.query.tenantId as string;
    const lat = req.query.lat as string;
    const lng = req.query.lng as string;
    const radius = req.query.radius as string;
    const priceMin = req.query.priceMin as string;
    const priceMax = req.query.priceMax as string;
    const bedrooms = req.query.bedrooms as string;
    const propertyType = req.query.propertyType as string;
    
    const ALGOLIA_APP_ID = process.env.VITE_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
    const ALGOLIA_API_KEY = process.env.VITE_ALGOLIA_SEARCH_KEY || process.env.ALGOLIA_API_KEY;
    const ALGOLIA_INDEX_NAME = process.env.VITE_ALGOLIA_INDEX_NAME || process.env.ALGOLIA_INDEX_NAME || 'properties';
    
    if (!ALGOLIA_APP_ID || !ALGOLIA_API_KEY) {
       // Graceful degradation / mock if no keys setup
       return res.json({
          hits: query ? [{ objectID: 'mock-1', id: 'MOCK-1', name: `Mock Result for "${query}"`, address: { city: 'Cape Town' } }] : []
       });
    }

    try {
      const { algoliasearch } = await import('algoliasearch');
      const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
      
      const filters: string[] = [];
      if (tenantId) filters.push(`tenantId:${tenantId}`);
      if (propertyType) filters.push(`propertyType:${propertyType}`);

      const numericFilters: string[] = [];
      if (priceMin) numericFilters.push(`price>=${priceMin}`);
      if (priceMax) numericFilters.push(`price<=${priceMax}`);
      if (bedrooms) numericFilters.push(`bedrooms>=${bedrooms}`);

      const searchParams: any = {
        query,
        hitsPerPage: 10
      };

      if (filters.length > 0) {
        searchParams.filters = filters.join(' AND ');
      }
      
      if (numericFilters.length > 0) {
        searchParams.numericFilters = numericFilters;
      }

      if (lat && lng) {
        searchParams.aroundLatLng = `${lat},${lng}`;
        if (radius) searchParams.aroundRadius = parseInt(radius, 10);
      }

      const results = await client.search({
         requests: [{
            indexName: ALGOLIA_INDEX_NAME,
            ...searchParams
         }]
      });
      const firstResult = results.results[0];
      const hits = (firstResult && 'hits' in firstResult) ? firstResult.hits : [];
      res.json({ hits, nbHits: (firstResult as any)?.nbHits });
    } catch (err: any) {
      console.error('Algolia Search error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/gemini', async (req, res) => {
    const { action, payload } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured on server" });
    }

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      });

      if (action === 'parseQuery') {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: `Parse the following search query into spatial mapping filters JSON: "${payload.query}"
          
          The available filters are:
          - priceMin (number)
          - priceMax (number)
          - municipality (string)
          - zoning (array of short strings like 'COM', 'RES', 'IND')
          - propertyExtentsMin (number in square meters)
          - propertyExtentsMax (number in square meters)
          - keyword (string)
          
          Return ONLY the JSON object.` }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        });
        return res.json({ text: result.response.text() });
      } else if (action === 'chat' || action === 'insights') {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: payload.prompt }] }],
          generationConfig: {
             // System instruction handled in prompt for simple proxy
          },
          // For system instruction in SDK:
          // systemInstruction: payload.systemInstruction
        });
        // Note: For newer SDK versions, systemInstruction is passed in model config
        // Re-init model with system instruction if provided
        let activeModel = model;
        if (payload.systemInstruction) {
           activeModel = genAI.getGenerativeModel({ 
             model: "gemini-1.5-flash",
             systemInstruction: payload.systemInstruction
           });
           const resultWithInstructions = await activeModel.generateContent(payload.prompt);
           return res.json({ text: resultWithInstructions.response.text() });
        }

        return res.json({ text: result.response.text() });
      }
      
      res.status(400).json({ error: "Invalid action" });
    } catch (err: any) {
      console.error("GEMINI_PROXY_ERROR", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Tile cache in memory
  const tileCache: Record<string, any> = {};

  app.get('/api/tiles/properties/:z/:x/:y.pbf', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
    const { z, x, y } = req.params;
    
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    res.setHeader('Content-Type', 'application/x-protobuf');
    
    try {
      const cacheKey = 'property_data_tiles';
      let tileIndex = tileCache[cacheKey];
      
      if (!tileIndex) {
         // Query the new Property Document Schema
         const snapshot = await db.collection('property_data').get();
         
         const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
         
         snapshot.forEach(doc => {
            const data = doc.data();
            if (data.location?.lat && data.location?.lng) {
               features.push({
                 type: 'Feature',
                 geometry: {
                    type: 'Point',
                    coordinates: [data.location.lng, data.location.lat]
                 },
                 properties: {
                    id: doc.id,
                    erfNumber: data.erfNumber || '',
                    valuation: data.valuation?.estimatedValue || 0,
                    riskScore: data.risk?.totalScore || 0,
                    propertyType: data.propertyType || '',
                    tenantId: data.tenantId || ''
                 }
               });
            }
         });
         
         const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
            type: 'FeatureCollection',
            features
         };
         
         // Generate index up to zoom 14
         tileIndex = geojsonvt(geojson, { maxZoom: 14, indexMaxZoom: 5 });
         tileCache[cacheKey] = tileIndex;
         
         // Setup cache expiration (15 mins)
         setTimeout(() => {
            delete tileCache[cacheKey];
         }, 15 * 60 * 1000);
      }
      
      const tile = tileIndex.getTile(Number(z), Number(x), Number(y));
      if (!tile) {
         return res.status(404).send('Tile empty');
      }
      
      const pbfBuffer = Buffer.from(vtpbf.fromGeojsonVt({ 'properties': tile }));
      res.send(pbfBuffer);
    } catch (err: any) {
      console.error('Properties Vector Tile Error:', err);
      res.status(500).send('Tile generation failed');
    }
  });

  app.get('/api/tiles/:layerId/:z/:x/:y.pbf', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
    const { layerId, z, x, y } = req.params;
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'application/x-protobuf');
    
    try {
      let tileIndex = tileCache[layerId];
      if (!tileIndex) {
        // Fetch geojson from Firestore
        const doc = await db.collection('imported_geojson').doc(layerId).get();
        if (!doc.exists) {
           return res.status(404).send('Layer not found');
        }
        const data = doc.data();
        let geojson = data?.geojson;
        if (!geojson && data?.features) {
           geojson = { type: 'FeatureCollection', features: data.features };
        }
        if (!geojson) {
           return res.status(404).send('No geojson data');
        }
        
        tileIndex = geojsonvt(geojson, { maxZoom: 14, indexMaxZoom: 5 });
        tileCache[layerId] = tileIndex;
      }
      
      const tile = tileIndex.getTile(Number(z), Number(x), Number(y));
      if (!tile) {
         return res.status(404).send('Tile not found');
      }
      
      const pbfBuffer = Buffer.from(vtpbf.fromGeojsonVt({ [layerId]: tile }));
      res.send(pbfBuffer);
    } catch (err: any) {
      console.error('Vector Tile Error:', err);
      res.status(500).send('Tile generation failed');
    }
  });

  app.post('/api/gisAgent', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
    const { query, userId, phase } = req.body;
    
    const reportRef = db.collection('gis_reports').doc();
    await reportRef.set({
       status: 'pending',
       query,
       userId,
       phase,
       createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ reportId: reportRef.id });
    
    // Process asynchronously (Cloud function simulation)
    (async () => {
       try {
         await reportRef.update({ status: 'processing' });
         
         const apiKey = process.env.GEMINI_API_KEY;
         if (!apiKey) throw new Error("Gemini API key missing");
         
         const { GoogleGenerativeAI } = await import("@google/generative-ai");
         const genAI = new GoogleGenerativeAI(apiKey);
         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
         
         const result = await model.generateContent(`Act as a GIS assistant. Analyze this query: "${query}" and return brief spatial insights or recommendations.`);
         
         await reportRef.update({
            status: 'complete',
            result: result.response.text(),
            completedAt: admin.firestore.FieldValue.serverTimestamp()
         });
       } catch (err: any) {
         await reportRef.update({
            status: 'error',
            error: err.message
         });
       }
    })();
  });

  app.post('/api/seed', async (req, res) => {
    if (!adminApp || !db) return res.status(500).json({error: 'Firebase Admin not initialized'});
    
    try {
       const tenantId = 'tenant_companyA';
       
       // Create Tenant
       await db.collection('tenants').doc(tenantId).set({
         id: tenantId,
         name: "Company A",
         status: "active"
       });

       const usersToCreate = [
         {
           email: 'superadmin@example.com',
           password: 'password123',
           role: 'superadmin',
           isSuperAdmin: true,
           tenantId: null
         },
         {
           email: 'admin@companya.com',
           password: 'password123',
           role: 'tenant_admin',
           isSuperAdmin: false,
           tenantId: tenantId
         },
         {
           email: 'user1@companya.com',
           password: 'password123',
           role: 'user',
           isSuperAdmin: false,
           tenantId: tenantId
         },
         {
           email: 'user2@companya.com',
           password: 'password123',
           role: 'user',
           isSuperAdmin: false,
           tenantId: tenantId
         }
       ];

       const createdUsers = [];

       for (const u of usersToCreate) {
         try {
           // Delete existing user if any
           const existing = await adminApp.auth().getUserByEmail(u.email);
           if (existing) await adminApp.auth().deleteUser(existing.uid);
         } catch(e) {}

         // Create fresh user
         const authUser = await adminApp.auth().createUser({
           email: u.email,
           password: u.password,
           emailVerified: true
         });

         // Set custom claims
         const claims: any = { role: u.role };
         if (u.tenantId) {
            claims.tenantId = u.tenantId; // Required for Identity Platform if used
         }
         await adminApp.auth().setCustomUserClaims(authUser.uid, claims);

         // Save to Firestore
         const firestoreUser = {
           uid: authUser.uid,
           email: u.email,
           role: u.role,
           tenantId: u.tenantId,
           isSuperAdmin: u.isSuperAdmin
         };

         await db.collection('users').doc(authUser.uid).set(firestoreUser);
         
         createdUsers.push({
           email: u.email,
           password: u.password,
           uid: authUser.uid,
           claims
         });
       }

       res.json({ message: "Seed completed successfully", users: createdUsers });
    } catch(err: any) {
       console.error("SEED_ERROR", err.stack);
       res.status(500).json({error: err.message, stack: err.stack});
    }
  });

  app.post('/api/register-tenant', async (req, res) => {
    if (!adminApp || !db) return res.status(500).json({error: 'Firebase Admin not initialized'});
    const { tenantName } = req.body;
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!tenantName || !idToken) {
       return res.status(400).json({error: "Missing tenantName or authorization header"});
    }

    try {
      const decodedToken = await adminApp.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const email = decodedToken.email || '';

      const tenantId = 'tenant_' + Math.random().toString(36).substr(2, 9);
      
      // Create Tenant
      await db.collection('tenants').doc(tenantId).set({
        id: tenantId,
        name: tenantName,
        status: "active"
      });

      // Set custom claims
      const claims: any = { role: 'tenant_admin', tenantId };
      await adminApp.auth().setCustomUserClaims(uid, claims);

      // Save to Firestore
      const firestoreUser = {
        uid: uid,
        email: email,
        role: 'tenant_admin',
        tenantId: tenantId,
        isSuperAdmin: false
      };

      await db.collection('users').doc(uid).set(firestoreUser);
      
      // We must generate a new custom token for the user to sign in with,
      // so they can immediately get the new claims in the client without needing to re-login manually
      const customToken = await adminApp.auth().createCustomToken(uid, claims);

      res.json({ message: "Tenant registered successfully", tenantId, customToken });
    } catch(err: any) {
      console.error("REGISTER_TENANT_ERROR", err.stack);
      res.status(500).json({error: err.message});
    }
  });

  app.post('/api/add-member', async (req, res) => {
    if (!adminApp || !db) return res.status(500).json({error: 'Firebase Admin not initialized'});
    
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).json({error: "Missing authorization header"});
    
    const { email, role, targetTenantId } = req.body;
    if (!email || !role || !targetTenantId) {
       return res.status(400).json({error: "Missing required fields"});
    }

    try {
      const decodedToken = await adminApp.auth().verifyIdToken(idToken);
      const adminUser = await adminApp.auth().getUser(decodedToken.uid);
      const adminRole = adminUser.customClaims?.role;
      const adminTenant = adminUser.customClaims?.tenantId;

      if (adminRole !== 'superadmin' && !(adminRole === 'tenant_admin' && adminTenant === targetTenantId)) {
         return res.status(403).json({error: "Insufficient permissions to add member to this tenant"});
      }

      // Find or create user
      let targetUser;
      try {
         targetUser = await adminApp.auth().getUserByEmail(email);
      } catch (e: any) {
         if (e.code === 'auth/user-not-found') {
             // For production, maybe they create user. Here we assume user exists or we create one
             targetUser = await adminApp.auth().createUser({ email, password: 'defaultPassword123!', emailVerified: true });
         } else {
             throw e;
         }
      }

      const claims = { role, tenantId: targetTenantId };
      await adminApp.auth().setCustomUserClaims(targetUser.uid, claims);

      const firestoreUser = {
        uid: targetUser.uid,
        email: email,
        role: role,
        tenantId: targetTenantId,
        isSuperAdmin: false
      };

      await db.collection('users').doc(targetUser.uid).set(firestoreUser, { merge: true });

      res.json({ message: "Member added successfully", uid: targetUser.uid });
    } catch (err: any) {
      console.error("ADD_MEMBER_ERROR", err.stack);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/validateAccess', async (req, res) => {
    // API endpoint per requirements (validateAccess(adminClaims, targetUser))
    const { adminClaims, targetUser } = req.body;
    
    if (!adminClaims || !targetUser) return res.status(400).json({error: "Bad Request"});
    
    let canAccess = false;
    if (adminClaims.role === 'superadmin') canAccess = true;
    else if (adminClaims.role === 'tenant_admin' && adminClaims.tenantId === targetUser.tenantId) canAccess = true;
    
    res.json({ canAccess });
  });

  app.post('/api/stop-impersonation', impersonateLimiter, async (req, res) => {
    if (!adminApp || !db) return res.status(500).json({error: 'Firebase Admin not initialized'});
    
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).json({error: "Missing authorization header"});

    try {
      const decodedToken = await adminApp.auth().verifyIdToken(idToken);
      const adminUid = decodedToken.impersonatedBy;
      
      if (!adminUid) {
        return res.status(400).json({error: "Not currently impersonating a user"});
      }

      // Generate custom token to return to the admin user
      const returnToken = await adminApp.auth().createCustomToken(adminUid as string);
      
      res.json({ customToken: returnToken });
    } catch (err: any) {
      console.error("STOP_IMPERSONATION_ERROR", err.stack);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/impersonate', impersonateLimiter, async (req, res) => {
     if (!adminApp || !db) return res.status(500).json({error: 'Firebase Admin not initialized'});
     const { targetUid } = req.body;
     const idToken = req.headers.authorization?.split('Bearer ')[1];
     
     if (!targetUid || !idToken) {
        return res.status(400).json({error: "Missing targetUid or authorization header"});
     }

     try {
       // Verify requester using their token
       const decodedToken = await adminApp.auth().verifyIdToken(idToken);
       const adminUid = decodedToken.uid;
       
       const adminUser = await adminApp.auth().getUser(adminUid);
       const adminClaims = adminUser.customClaims || {};
       
       const role = adminClaims.role;
       const adminTenantId = adminClaims.tenantId;

       if (role !== 'superadmin' && role !== 'tenant_admin') {
          return res.status(403).json({error: "Only admins can impersonate"});
       }

       // Get target user
       const targetUser = await adminApp.auth().getUser(targetUid);
       const targetClaims = targetUser.customClaims || {};
       const targetTenantId = targetClaims.tenantId;

       if (role === 'tenant_admin') {
          if (!adminTenantId || adminTenantId !== targetTenantId) {
             return res.status(403).json({error: "Cannot impersonate a user from a different tenant"});
          }
       }

       await db.collection('impersonation_logs').add({
          adminUid,
          targetUid,
          timestamp: admin.firestore.FieldValue.serverTimestamp() // Notice how we use FieldValue here
       });

       // Generate custom token
       const extraClaims = {
          impersonatedBy: adminUid,
          impersonatorRole: role,
          tenantId: targetTenantId,
          role: targetClaims.role || 'user'
       };
       
       const customToken = await adminApp.auth().createCustomToken(targetUid, extraClaims);
       
       res.json({ customToken });
     } catch (err: any) {
       console.error(err);
       res.status(500).json({ error: err.message });
     }
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mode: process.env.NODE_ENV,
      cwd: process.cwd(),
      hasDist: fs.existsSync(path.join(process.cwd(), 'dist'))
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("[INIT] Running in DEVELOPMENT mode with Vite middleware.");
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static assets from 'dist'
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const distPath = path.resolve(__dirname, 'dist');
    
    console.log(`[INIT] Running in PRODUCTION mode.`);
    console.log(`[INIT] Path resolution:`);
    console.log(`  - __dirname: ${__dirname}`);
    console.log(`  - distPath: ${distPath}`);
    console.log(`  - index.html exists: ${fs.existsSync(path.join(distPath, 'index.html'))}`);

    // Middleware 1: Static assets with long-term caching
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      fallthrough: false // If it's in assets and not found, it's a 404, not an SPA route
    }));

    // Middleware 2: Other static files (icons, manifest, etc)
    app.use(express.static(distPath, { 
      index: false, // Don't automatically serve index.html via middleware
      fallthrough: true 
    }));

    // Explicit block for dev leaks to prevent confusing 404s
    app.get(['/src/*', '/node_modules/*', '/@vite/*', '/@fs/*'], (req, res) => {
      console.warn(`[WARN] Blocked dev-mode request: ${req.path}`);
      res.status(403).send('Forbidden: Dev-mode assets are not available in production.');
    });

    // Middleware 3: SPA Fallback - Serve the built index.html for ALL other non-file routes
    app.get('*all', (req, res) => {
      // If the request looks like a missing file (has an extension), don't serve index.html
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return res.status(404).send('Asset not found');
      }
      
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(500).send("Build artifact (index.html) missing. Please check deployment pipeline.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[FATAL] Server failed to start:", err);
  process.exit(1);
});
