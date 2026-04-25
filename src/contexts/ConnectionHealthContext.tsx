import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { CCT_OPEN_DATA_CONFIG } from '@/src/source_connectors/cctOpenDataClient';

export type ServiceStatus = 'operational' | 'degraded' | 'offline' | 'checking';

export interface ServiceHealth {
  id: string;
  name: string;
  endpoint: string;
  status: ServiceStatus;
  lastChecked: Date | null;
  errorMessage?: string;
  httpCode?: number;
}

interface ConnectionHealthContextType {
  services: ServiceHealth[];
  checkAllServices: () => Promise<void>;
  getServiceStatus: (id: string) => ServiceStatus;
}

const ConnectionHealthContext = createContext<ConnectionHealthContextType | undefined>(undefined);

const INITIAL_SERVICES: ServiceHealth[] = [
  {
    id: 'firestore',
    name: 'Firebase Database',
    endpoint: 'Firestore',
    status: 'checking',
    lastChecked: null,
  },
  {
    id: 'cct-parcels',
    name: 'CCT Cadastral Parcels (Open Data)',
    endpoint: `${CCT_OPEN_DATA_CONFIG.parcelsEndpoint}?f=json`,
    status: 'checking',
    lastChecked: null,
  },
  {
    id: 'cct-zoning',
    name: 'CCT Zoning Base (Open Data)',
    endpoint: `${CCT_OPEN_DATA_CONFIG.zoningEndpoint}?f=json`,
    status: 'checking',
    lastChecked: null,
  },
  {
    id: 'ee-api',
    name: 'Google Earth Engine API',
    endpoint: 'https://earthengine.googleapis.com/$discovery/rest?version=v1alpha',
    status: 'checking',
    lastChecked: null,
  }
];

export const ConnectionHealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES);

  const checkService = async (service: ServiceHealth): Promise<ServiceHealth> => {
    try {
      if (service.id === 'firestore') {
         const t0 = performance.now();
         let isOk = false;
         let errMsg = '';
         try {
            await getDocFromServer(doc(db, 'system', 'health_check'));
            isOk = true;
         } catch (e: any) {
            // Missing or insufficient permissions still means it's online
            if (e.code === 'permission-denied') {
              isOk = true;
            } else if (e.code === 'unavailable') {
              // Firebase returns unavailable if offline or blocked by network config. We can treat it as degraded instead of failing completely, since it falls back to cache.
              isOk = true;
            } else {
              errMsg = e.message || String(e);
            }
         }
         const t1 = performance.now();
         if (isOk) {
            return {
              ...service,
              status: (t1 - t0 > 2000) ? 'degraded' : 'operational',
              lastChecked: new Date(),
              errorMessage: undefined
            };
         } else {
            return {
              ...service,
              status: 'offline',
              lastChecked: new Date(),
              errorMessage: errMsg || 'Firestore Unreachable'
            };
         }
      }

      // Use GET as HEAD might be blocked by some ArcGIS servers
      const response = await fetch(service.endpoint, { method: 'GET', cache: 'no-store' });
      
      if (response.ok) {
        return {
          ...service,
          status: 'operational',
          lastChecked: new Date(),
          httpCode: response.status,
          errorMessage: undefined,
        };
      } else {
        return {
          ...service,
          status: 'offline',
          lastChecked: new Date(),
          httpCode: response.status,
          errorMessage: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Network Error',
      };
    }
  };

  const checkAllServices = async () => {
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
    const updatedServices = await Promise.all(services.map(checkService));
    setServices(updatedServices);
  };

  useEffect(() => {
    checkAllServices();
    // Re-check every 3 minutes
    const interval = setInterval(checkAllServices, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getServiceStatus = (id: string) => {
    return services.find(s => s.id === id)?.status || 'offline';
  };

  return (
    <ConnectionHealthContext.Provider value={{ services, checkAllServices, getServiceStatus }}>
      {children}
    </ConnectionHealthContext.Provider>
  );
};

export const useConnectionHealth = () => {
  const context = useContext(ConnectionHealthContext);
  if (context === undefined) {
    throw new Error('useConnectionHealth must be used within a ConnectionHealthProvider');
  }
  return context;
};
