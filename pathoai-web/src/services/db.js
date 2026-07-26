/* ═══════════════════════════════════════════════════════════════
   PathoAI Frontend IndexedDB Database Service
   Browser Native Persistent NoSQL Storage engine
   ═══════════════════════════════════════════════════════════════ */

const DB_NAME = 'PathoAI_Frontend_DB';
const DB_VERSION = 1;

let dbInstance = null;

// Initial Seed Configuration — Empty by default for pure database-driven operation
const SEED_PATIENTS = [];
const SEED_SETTINGS = [];


// Open / Initialize IndexedDB
export async function initDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // 1. Store: patients
      if (!db.objectStoreNames.contains('patients')) {
        const patientStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
        patientStore.createIndex('name', 'name', { unique: false });
        patientStore.createIndex('risk_score', 'risk_score', { unique: false });
        patientStore.createIndex('status', 'status', { unique: false });
        patientStore.createIndex('biopsy_site', 'biopsy_site', { unique: false });
      }

      // 2. Store: slides
      if (!db.objectStoreNames.contains('slides')) {
        const slideStore = db.createObjectStore('slides', { keyPath: 'id' });
        slideStore.createIndex('patient_id', 'patient_id', { unique: false });
      }

      // 3. Store: settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // 4. Store: session
      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session', { keyPath: 'key' });
      }
    };

    request.onsuccess = async (e) => {
      dbInstance = e.target.result;
      await seedIfEmpty(dbInstance);
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('IndexedDB open error:', e.target.error);
      reject(e.target.error);
    };
  });
}

// Seed initial clinical data if database is empty
async function seedIfEmpty(db) {
  const patientCount = await countRecords(db, 'patients');
  if (patientCount === 0) {
    const tx = db.transaction(['patients', 'settings'], 'readwrite');
    const pStore = tx.objectStore('patients');
    const sStore = tx.objectStore('settings');

    SEED_PATIENTS.forEach(p => pStore.add(p));
    SEED_SETTINGS.forEach(s => sStore.add(s));

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        console.log('IndexedDB seeded with initial clinical biopsy records.');
        resolve();
      };
    });
  }
}

function countRecords(db, storeName) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(0);
  });
}

/* ═══════════════════════════════════════════════════════════════
   Patient Store API
   ═══════════════════════════════════════════════════════════════ */
export async function dbGetAllPatients() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('patients', 'readonly');
    const store = tx.objectStore('patients');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function dbGetPatientById(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('patients', 'readonly');
    const store = tx.objectStore('patients');
    const request = store.get(Number(id));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbSavePatient(patientData) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('patients', 'readwrite');
    const store = tx.objectStore('patients');
    
    // Ensure date is populated
    if (!patientData.date) patientData.date = new Date().toISOString().split('T')[0];

    const request = patientData.id ? store.put(patientData) : store.add(patientData);

    request.onsuccess = (e) => {
      const savedId = patientData.id || e.target.result;
      resolve({ ...patientData, id: savedId });
    };
    request.onerror = () => reject(request.error);
  });
}

export async function dbDeletePatient(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('patients', 'readwrite');
    const store = tx.objectStore('patients');
    const request = store.delete(Number(id));

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/* ═══════════════════════════════════════════════════════════════
   Settings & Session API
   ═══════════════════════════════════════════════════════════════ */
export async function dbGetSetting(key) {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result ? request.result.value : null);
    request.onerror = () => resolve(null);
  });
}

export async function dbSetSetting(key, value) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const request = store.put({ key, value });

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/* ═══════════════════════════════════════════════════════════════
   Database Import & Export JSON Backups
   ═══════════════════════════════════════════════════════════════ */
export async function exportDatabaseJSON() {
  const patients = await dbGetAllPatients();
  const doctorProfile = await dbGetSetting('doctor_profile');

  const backupObj = {
    app: "PathoAI Clinical Suite",
    version: DB_VERSION,
    export_date: new Date().toISOString(),
    patients,
    doctor_profile: doctorProfile
  };

  const jsonStr = JSON.stringify(backupObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `PathoAI_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function resetDatabaseToSeed() {
  const db = await initDB();
  const tx = db.transaction(['patients', 'settings'], 'readwrite');
  tx.objectStore('patients').clear();
  tx.objectStore('settings').clear();

  return new Promise((resolve) => {
    tx.oncomplete = async () => {
      await seedIfEmpty(db);
      resolve(true);
    };
  });
}
