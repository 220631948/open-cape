export const DB_NAME = 'tile-cache-db';
export const DB_VERSION = 1;
export const STORE_NAME = 'tiles';
export const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export interface TileRecord {
  url: string;
  data: ArrayBuffer;
  timestamp: number;
  size: number;
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getTile = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(url);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const record = getRequest.result as TileRecord;
          record.timestamp = Date.now(); // Update for LRU
          store.put(record);
          resolve(record.data);
        } else {
          resolve(null);
        }
      };
      getRequest.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

export const putTile = async (url: string, data: ArrayBuffer): Promise<void> => {
  try {
    const size = data.byteLength;
    const db = await openDB();
    
    await enforceSizeLimit(db, size);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record: TileRecord = {
        url,
        data,
        timestamp: Date.now(),
        size
      };
      store.put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.warn("Tile cache put error:", e);
  }
};

const enforceSizeLimit = async (db: IDBDatabase, incomingSize: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    let totalSize = 0;
    const cursors: { key: IDBValidKey; size: number }[] = [];
    const request = index.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        const record = cursor.value as TileRecord;
        totalSize += (record.size || 0);
        cursors.push({ key: cursor.primaryKey, size: record.size || 0 });
        cursor.continue();
      } else {
        if (totalSize + incomingSize > MAX_SIZE) {
           let toDelete = (totalSize + incomingSize) - MAX_SIZE;
           for (const item of cursors) {
             store.delete(item.key);
             toDelete -= item.size;
             if (toDelete <= 0) break;
           }
        }
        resolve();
      }
    };
    request.onerror = () => resolve();
  });
};

export const clearCache = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      transaction.oncomplete = () => resolve();
    });
  } catch (e) {}
};
