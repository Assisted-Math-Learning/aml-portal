import { IDBPDatabase, openDB } from 'idb';
import { IDBDataStatus, IDBStores } from '../types/enum';

const DB_NAME = 'aml_portal';
const STORE_NAMES = Object.values(IDBStores);
const DB_VERSION = 2;

class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase<unknown> | null> | null;

  constructor() {
    this.dbPromise = null;
  }

  initializeDB = async () => {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          STORE_NAMES.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, {
                keyPath: 'id',
                autoIncrement: true,
              });
            }
          });
        },
      }).catch((error) => {
        console.error('Error opening IndexedDB:', error);
        return null;
      });
    }
    return this.dbPromise;
  };

  // Method to get DB instance, also an arrow function to preserve 'this'
  getDB = async () => {
    if (!this.dbPromise) {
      await this.initializeDB();
    }
    return this.dbPromise;
  };

  addObject = async (object: any, storeName = IDBStores.LEARNER_DATA) => {
    const db = await this.getDB();
    await db?.add(storeName, object);
  };

  getObjectById = async (
    id: IDBKeyRange | IDBValidKey,
    storeName = IDBStores.LEARNER_DATA
  ) => {
    const db = await this.getDB();
    return db?.get(storeName, id);
  };

  deleteObjectById = async (
    id: IDBValidKey | IDBKeyRange,
    storeName = IDBStores.LEARNER_DATA
  ) => {
    const db = await this.getDB();
    await db?.delete(storeName, id);
  };

  deleteObjectsByIds = async (
    ids: number[],
    storeName = IDBStores.LEARNER_DATA
  ) => {
    const db = await this.getDB();
    if (!db) {
      console.error('IndexedDB is not initialized');
      return;
    }

    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await store.delete(id); // Delete the object with the given ID
      }
      await transaction.done; // Ensure the transaction completes
    } catch (error) {
      console.error('Error deleting objects:', error);
    }
  };

  getAllObjects = async (storeName = IDBStores.LEARNER_DATA) => {
    const db = await this.getDB();
    return db?.getAll(storeName);
  };

  queryObjectsByKey = async (
    key: string | number,
    value: any,
    storeName = IDBStores.LEARNER_DATA
  ) => {
    const db = await this.getDB();
    const tx = db?.transaction(storeName, 'readonly');
    const store = tx?.objectStore(storeName);
    const allObjects = await store?.getAll();

    return allObjects?.filter((object) => object[key] === value);
  };

  queryObjectsByKeys = async (
    criteria: any,
    storeName = IDBStores.LEARNER_DATA
  ) => {
    const db = await this.getDB();
    const tx = db?.transaction(storeName, 'readonly');
    const store = tx?.objectStore(storeName);
    const allObjects = await store?.getAll();

    // Filter objects based on all key-value pairs in the criteria
    return allObjects?.filter((object) =>
      Object.entries(criteria).every(([key, value]) => object[key] === value)
    );
  };

  updateObjectById = async (
    id: number,
    updates: any,
    storeName = IDBStores.LEARNER_DATA
  ) => {
    const db = await this.getDB();
    const tx = db?.transaction(storeName, 'readwrite');
    const store = tx?.objectStore(storeName);

    // Retrieve the existing object by id
    const object = await store?.get(id);

    if (object) {
      // Update the object with the new values
      Object.assign(object, updates);
      // Save the updated object back to the store
      await store?.put(object);
    }

    await tx?.done;
  };

  updateStatusByIds = async (
    ids: number[],
    newStatus: IDBDataStatus,
    storeName = IDBStores.LEARNER_DATA
  ) => {
    const db = await this.getDB();
    if (!db) {
      console.error('IndexedDB is not initialized');
      return;
    }

    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        const object = await store.get(id);
        if (object) {
          object.status = newStatus; // Update the status key
          // eslint-disable-next-line no-await-in-loop
          await store.put(object); // Save the updated object back to the store
        } else {
          console.warn(`Object with ID ${id} not found`);
        }
      }
      await transaction.done;
      console.log('Status updated successfully for specified IDs');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  clearStore = async (storeName = IDBStores.LEARNER_DATA) => {
    const db = await this.getDB();
    await db?.clear(storeName);
  };
}

export const indexedDBService = new IndexedDbService();
