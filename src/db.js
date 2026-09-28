/**
 * db.js — IndexedDB wrapper for CatatVoice
 *
 * Stores all transactions in an IndexedDB database called "CatatVoiceDB"
 * with one object store "transactions" keyed by `id`.
 * Indexes: byDate (date field) for efficient daily queries.
 */

const DB_NAME = 'CatatVoiceDB';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('byDate', 'date', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all transactions, sorted newest-first by id (timestamp).
 */
export async function getAllTransactions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort descending by id (which is Date.now())
      const sorted = request.result.sort((a, b) => b.id - a.id);
      resolve(sorted);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a single transaction to the store.
 */
export async function addTransaction(transaction) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(transaction);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a transaction by its id.
 */
export async function deleteTransaction(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update an existing transaction (put overwrites the record with the same id).
 */
export async function updateTransaction(transaction) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(transaction);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Seed the database with initial data only if the store is empty.
 * Returns the full list after seeding.
 */
export async function seedIfEmpty(seedData) {
  const existing = await getAllTransactions();
  if (existing.length > 0) return existing;

  for (const item of seedData) {
    await addTransaction(item);
  }
  return getAllTransactions();
}
