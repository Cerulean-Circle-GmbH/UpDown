/**
 * BrowserScenarioStorage - IndexedDB scenario storage for BrowserOnce
 * 
 * Implements PersistenceManager interface with IndexedDB backend.
 * Same logical structure as UcpStorage (filesystem) but browser-native.
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 6: Empty Constructor + init()
 * ✅ Web4 Principle 24: RelatedObjects Registry lookup
 * 
 * Storage Structure (IndexedDB):
 * ```
 * scenarios-index:    Primary storage by UUID
 * scenarios-type:     Index by component/version
 * scenarios-domain:   Index by domain/component/version
 * scenarios-capability: Index by capability/value
 * ```
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import type { PersistenceManager, ScenarioQuery } from '../layer3/PersistenceManager.interface.js';
import type { StorageScenario } from '../layer3/StorageScenario.interface.js';
import type { StorageModel } from '../layer3/StorageModel.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { Model } from '../layer3/Model.interface.js';

/** Database name */
const DB_NAME = 'once-scenarios';

/** 
 * Database version
 * v1: Initial schema (scenarios-index, type, domain, capability)
 * v2: Added artefacts store for Blob content (I.9.2)
 */
const DB_VERSION = 2;

/** Object store names */
const STORE_INDEX = 'scenarios-index';
const STORE_TYPE = 'scenarios-type';
const STORE_DOMAIN = 'scenarios-domain';
const STORE_CAPABILITY = 'scenarios-capability';
/** Artefact store: content-addressable Blob storage (I.9.2) */
const STORE_ARTEFACTS = 'artefacts';

/**
 * BrowserScenarioStorage - IndexedDB implementation of PersistenceManager
 * 
 * Usage:
 * ```typescript
 * import { PersistenceManager } from '../layer3/PersistenceManager.interface.js';
 * 
 * const storage = new BrowserScenarioStorage().init({...});
 * controller.relatedObjectRegister(PersistenceManager, storage);
 * 
 * // Lookup from anywhere
 * const pm = controller.relatedObjectLookupFirst(PersistenceManager);
 * await pm.scenarioSave(uuid, scenario, []);
 * ```
 */
export class BrowserScenarioStorage implements PersistenceManager {
  
  /** Storage model */
  private model: StorageModel;
  
  /** IndexedDB instance */
  private db: IDBDatabase | null = null;
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    // Empty - initialization via init()
    this.model = {
      uuid: '',
      projectRoot: '',
      indexBaseDir: '',
      createdAt: '',
      updatedAt: ''
    };
  }
  
  /**
   * Initialize from scenario - Web4 pattern
   * Opens/creates IndexedDB database
   */
  init(scenario: StorageScenario): this {
    this.model = { ...scenario.model };
    return this;
  }
  
  /**
   * Open IndexedDB database (lazy)
   */
  private async dbOpen(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains(STORE_INDEX)) {
          db.createObjectStore(STORE_INDEX, { keyPath: 'uuid' });
        }
        
        if (!db.objectStoreNames.contains(STORE_TYPE)) {
          const typeStore = db.createObjectStore(STORE_TYPE, { keyPath: 'key' });
          typeStore.createIndex('uuid', 'uuid', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_DOMAIN)) {
          const domainStore = db.createObjectStore(STORE_DOMAIN, { keyPath: 'key' });
          domainStore.createIndex('uuid', 'uuid', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_CAPABILITY)) {
          const capStore = db.createObjectStore(STORE_CAPABILITY, { keyPath: 'key' });
          capStore.createIndex('uuid', 'uuid', { unique: false });
        }
        
        // I.9.2: Artefact store for content-addressable Blob storage
        // Key is contentHash (SHA-256), enables deduplication
        if (!db.objectStoreNames.contains(STORE_ARTEFACTS)) {
          const artefactStore = db.createObjectStore(STORE_ARTEFACTS, { keyPath: 'contentHash' });
          artefactStore.createIndex('unitUuid', 'unitUuid', { unique: false });
          artefactStore.createIndex('mimetype', 'mimetype', { unique: false });
        }
        
        console.log('[BrowserScenarioStorage] Created IndexedDB stores');
      };
    });
  }
  
  /**
   * Save scenario to IndexedDB
   * 
   * @param uuid Scenario UUID
   * @param scenario Scenario to save
   * @param symlinkPaths Array of "symlink" paths (type/domain/capability keys)
   */
  async scenarioSave<T extends Model>(
    uuid: string, 
    scenario: Scenario<T>, 
    symlinkPaths: string[]
  ): Promise<void> {
    const db = await this.dbOpen();
    
    // Prepare scenario with metadata
    const scenarioWithMeta = {
      uuid,
      ...scenario,
      model: {
        ...scenario.model,
        updatedAt: new Date().toISOString()
      }
    };
    
    const transaction = db.transaction(
      [STORE_INDEX, STORE_TYPE, STORE_DOMAIN, STORE_CAPABILITY],
      'readwrite'
    );
    
    // Save to primary index
    const indexStore = transaction.objectStore(STORE_INDEX);
    indexStore.put(scenarioWithMeta);
    
    // Create "symlink" entries for each path
    for (const linkPath of symlinkPaths) {
      const pathType = this.linkPathTypeGet(linkPath);
      
      if (pathType === 'type') {
        const typeStore = transaction.objectStore(STORE_TYPE);
        typeStore.put({ key: linkPath, uuid });
      } else if (pathType === 'domain') {
        const domainStore = transaction.objectStore(STORE_DOMAIN);
        domainStore.put({ key: linkPath, uuid });
      } else if (pathType === 'capability') {
        const capStore = transaction.objectStore(STORE_CAPABILITY);
        capStore.put({ key: linkPath, uuid });
      }
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`[BrowserScenarioStorage] Saved scenario: ${uuid}`);
        resolve();
      };
      transaction.onerror = () => {
        reject(new Error(`Failed to save scenario: ${transaction.error}`));
      };
    });
  }
  
  /**
   * Load scenario from IndexedDB
   * 
   * @param uuid Scenario UUID to load
   */
  async scenarioLoad<T extends Model>(uuid: string): Promise<Scenario<T>> {
    const db = await this.dbOpen();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_INDEX, 'readonly');
      const store = transaction.objectStore(STORE_INDEX);
      const request = store.get(uuid);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result as Scenario<T>);
        } else {
          reject(new Error(`Scenario not found: ${uuid}`));
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to load scenario: ${request.error}`));
      };
    });
  }
  
  /**
   * Find scenarios by query
   * 
   * @param query Query with optional filters
   */
  async scenarioFind<T extends Model>(query: ScenarioQuery): Promise<Scenario<T>[]> {
    const db = await this.dbOpen();
    const results: Scenario<T>[] = [];
    
    // Determine which index to search
    let storeName = STORE_INDEX;
    let keyPrefix = '';
    
    if (query.domain) {
      storeName = STORE_DOMAIN;
      keyPrefix = `domain/${query.domain}`;
      if (query.component) {
        keyPrefix += `/${query.component}`;
        if (query.version) {
          keyPrefix += `/${query.version}`;
        }
      }
    } else if (query.component) {
      storeName = STORE_TYPE;
      keyPrefix = `type/${query.component}`;
      if (query.version) {
        keyPrefix += `/${query.version}`;
      }
    } else if (query.capabilityType && query.capabilityValue) {
      storeName = STORE_CAPABILITY;
      keyPrefix = `capability/${query.capabilityType}/${query.capabilityValue}`;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName, STORE_INDEX], 'readonly');
      
      if (storeName === STORE_INDEX) {
        // Search all scenarios
        const store = transaction.objectStore(STORE_INDEX);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result as Scenario<T>[]);
        };
        request.onerror = () => reject(request.error);
      } else {
        // Search via index, then load full scenarios
        const indexStore = transaction.objectStore(storeName);
        const indexRequest = indexStore.getAll(IDBKeyRange.bound(keyPrefix, keyPrefix + '\uffff'));
        
        indexRequest.onsuccess = async () => {
          const entries = indexRequest.result as Array<{ uuid: string }>;
          const uuids = entries.map(e => e.uuid);
          
          // Load each scenario
          const scenarioStore = transaction.objectStore(STORE_INDEX);
          for (const uuid of uuids) {
            const scenarioRequest = scenarioStore.get(uuid);
            scenarioRequest.onsuccess = () => {
              if (scenarioRequest.result) {
                results.push(scenarioRequest.result as Scenario<T>);
              }
            };
          }
          
          transaction.oncomplete = () => resolve(results);
        };
        
        indexRequest.onerror = () => reject(indexRequest.error);
      }
    });
  }
  
  /**
   * Delete scenario from IndexedDB
   */
  async scenarioDelete(uuid: string, removeSymlinks: boolean = true): Promise<void> {
    const db = await this.dbOpen();
    
    const stores = removeSymlinks 
      ? [STORE_INDEX, STORE_TYPE, STORE_DOMAIN, STORE_CAPABILITY]
      : [STORE_INDEX];
    
    const transaction = db.transaction(stores, 'readwrite');
    
    // Delete from primary store
    transaction.objectStore(STORE_INDEX).delete(uuid);
    
    // Delete from index stores if requested
    if (removeSymlinks) {
      // Delete all entries with this UUID from each index
      for (const storeName of [STORE_TYPE, STORE_DOMAIN, STORE_CAPABILITY]) {
        const store = transaction.objectStore(storeName);
        const index = store.index('uuid');
        const request = index.openCursor(IDBKeyRange.only(uuid));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      }
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`[BrowserScenarioStorage] Deleted scenario: ${uuid}`);
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }
  
  /**
   * Check if scenario exists
   */
  async scenarioExists(uuid: string): Promise<boolean> {
    try {
      await this.scenarioLoad(uuid);
      return true;
    } catch {
      return false;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Artefact Storage (I.9.2-I.9.5)
  // Content-addressable Blob storage for deduplication
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Save artefact with Blob content (I.9.3)
   * 
   * Key is contentHash (SHA-256) - same content = same artefact
   * IndexedDB natively supports Blob storage
   * 
   * @param contentHash SHA-256 hash of content
   * @param blob Content as Blob
   * @param metadata Artefact metadata (size, mimetype, unitUuid)
   */
  async artefactSave(
    contentHash: string,
    blob: Blob,
    metadata: { size: number; mimetype: string; unitUuid: string }
  ): Promise<void> {
    const db = await this.dbOpen();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ARTEFACTS, 'readwrite');
      const store = transaction.objectStore(STORE_ARTEFACTS);
      
      const artefactRecord = {
        contentHash,
        content: blob,  // IndexedDB natively stores Blob
        size: metadata.size,
        mimetype: metadata.mimetype,
        unitUuid: metadata.unitUuid,
        createdAt: Date.now()
      };
      
      store.put(artefactRecord);
      
      transaction.oncomplete = () => {
        console.log(`[BrowserScenarioStorage] 📦 Artefact saved: ${contentHash.substring(0, 16)}...`);
        resolve();
      };
      transaction.onerror = () => {
        reject(new Error(`Failed to save artefact: ${transaction.error}`));
      };
    });
  }
  
  /**
   * Load artefact by content hash (I.9.4)
   * 
   * @param contentHash SHA-256 hash
   * @returns Artefact with Blob content, or null if not found
   */
  async artefactLoad(contentHash: string): Promise<{ content: Blob; size: number; mimetype: string; unitUuid: string } | null> {
    const db = await this.dbOpen();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ARTEFACTS, 'readonly');
      const store = transaction.objectStore(STORE_ARTEFACTS);
      const request = store.get(contentHash);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve({
            content: request.result.content,
            size: request.result.size,
            mimetype: request.result.mimetype,
            unitUuid: request.result.unitUuid
          });
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to load artefact: ${request.error}`));
      };
    });
  }
  
  /**
   * Check if artefact exists (I.9.5)
   * Used for deduplication - don't re-store same content
   * 
   * @param contentHash SHA-256 hash
   * @returns true if artefact exists
   */
  async artefactExists(contentHash: string): Promise<boolean> {
    const db = await this.dbOpen();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ARTEFACTS, 'readonly');
      const store = transaction.objectStore(STORE_ARTEFACTS);
      const request = store.count(IDBKeyRange.only(contentHash));
      
      request.onsuccess = () => {
        resolve(request.result > 0);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to check artefact: ${request.error}`));
      };
    });
  }
  
  /**
   * Convert storage to scenario for hibernation
   */
  async toScenario(): Promise<StorageScenario> {
    return {
      ior: {
        uuid: this.model.uuid,
        component: 'BrowserScenarioStorage',
        version: '0.3.21.9'
      },
      owner: 'browser',
      model: this.model
    };
  }
  
  /**
   * Determine link path type from path string
   */
  private linkPathTypeGet(linkPath: string): 'type' | 'domain' | 'capability' | 'unknown' {
    if (linkPath.startsWith('type/')) return 'type';
    if (linkPath.startsWith('domain/')) return 'domain';
    if (linkPath.startsWith('capability/')) return 'capability';
    return 'unknown';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Symlink Path Builders (PersistenceManager interface)
  // Returns RELATIVE paths for use with scenarioSave()
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Build type symlink path (relative)
   * @returns Relative path like: type/ONCE/0.3.21.9
   */
  typePathBuild(component: string, version: string): string {
    return `type/${component}/${version}`;
  }
  
  /**
   * Build domain symlink path with hostname (relative)
   * @param domainParts Array like ['box', 'fritz']
   * @param hostname Hostname like 'McDonges'
   * @returns Relative path like: domain/box/fritz/McDonges/ONCE/0.3.21.9
   */
  domainPathBuild(domainParts: string[], hostname: string, component: string, version: string): string {
    return `domain/${domainParts.join('/')}/${hostname}/${component}/${version}`;
  }
  
  /**
   * Build capability symlink path under domain (relative)
   * @param domainParts Array like ['box', 'fritz']
   * @param hostname Hostname like 'McDonges'
   * @returns Relative path like: domain/box/fritz/McDonges/ONCE/0.3.21.9/capability/httpPort/42777
   */
  capabilityPathBuild(
    domainParts: string[], 
    hostname: string, 
    component: string, 
    version: string,
    capabilityType: string, 
    capabilityValue: string
  ): string {
    return `domain/${domainParts.join('/')}/${hostname}/${component}/${version}/capability/${capabilityType}/${capabilityValue}`;
  }
}

