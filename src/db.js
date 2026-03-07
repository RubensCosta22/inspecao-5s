// db.js — IndexedDB wrapper para persistência offline
// Compatível com PWA e Capacitor (WebView)

const DB_NAME = 'inspecao5s_db';
const DB_VERSION = 1;
const STORE_INSPECTIONS = 'inspections';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_INSPECTIONS)) {
        const store = db.createObjectStore(STORE_INSPECTIONS, { keyPath: 'id' });
        store.createIndex('by_data', 'data', { unique: false });
        store.createIndex('by_area', 'area', { unique: false });
        store.createIndex('by_local', 'local', { unique: false });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveInspection(inspection) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INSPECTIONS, 'readwrite');
    tx.objectStore(STORE_INSPECTIONS).put(inspection);
    tx.oncomplete = () => resolve(inspection);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllInspections() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INSPECTIONS, 'readonly');
    const request = tx.objectStore(STORE_INSPECTIONS).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.id - a.id));
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteInspection(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INSPECTIONS, 'readwrite');
    tx.objectStore(STORE_INSPECTIONS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getInspectionById(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_INSPECTIONS, 'readonly');
    const request = tx.objectStore(STORE_INSPECTIONS).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}
