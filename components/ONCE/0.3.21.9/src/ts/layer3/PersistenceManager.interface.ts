/**
 * PersistenceManager Interface - Common storage interface for all platforms
 * 
 * ✅ Web4 Principle 24: RelatedObjects Registry
 * ✅ Web4 Principle 19: One File One Type (ScenarioQuery extracted)
 * ✅ Web4 JsInterface: Runtime-existing interface for type introspection
 * 
 * Both NodeJS (filesystem) and Browser (IndexedDB) implement this interface.
 * Can be looked up from RelatedObjects registry by any component.
 * 
 * Usage:
 * ```typescript
 * // Register in static start()
 * PersistenceManager.implementationRegister(UcpStorage);
 * 
 * // Lookup from anywhere
 * const storage = controller.relatedObjectLookup(PersistenceManager);
 * await storage.scenarioSave(uuid, scenario, symlinkPaths);
 * ```
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 * @pdca 2025-12-09-UTC-1500.jsinterface-migration-persistence-manager.pdca.md
 */

import type { Scenario } from './Scenario.interface.js';
import type { Model } from './Model.interface.js';
import type { ScenarioQuery } from './ScenarioQuery.interface.js';
import { JsInterface } from './JsInterface.js';

// Re-export for backward compatibility
export type { ScenarioQuery } from './ScenarioQuery.interface.js';

/**
 * PersistenceManager - Platform-agnostic scenario storage interface
 * 
 * Extends JsInterface for runtime type introspection and registration.
 * 
 * Implementations:
 * - UcpStorage: Filesystem with UUID index + symlinks (NodeJS)
 * - BrowserScenarioStorage: IndexedDB with same logical structure
 * 
 * @interface
 */
export abstract class PersistenceManager extends JsInterface {
  
  /**
   * Save scenario to storage
   * 
   * @param uuid Scenario UUID
   * @param scenario Scenario to save
   * @param symlinkPaths Array of symlink paths (type/domain/capability)
   */
  abstract scenarioSave<T extends Model>(
    uuid: string, 
    scenario: Scenario<T>, 
    symlinkPaths: string[]
  ): Promise<void>;
  
  /**
   * Load scenario from storage
   * 
   * @param uuid Scenario UUID to load
   * @returns Scenario or throws if not found
   */
  abstract scenarioLoad<T extends Model>(uuid: string): Promise<Scenario<T>>;
  
  /**
   * Find scenarios by query
   * 
   * @param query Query with optional filters
   * @returns Array of matching scenarios
   */
  abstract scenarioFind<T extends Model>(query: ScenarioQuery): Promise<Scenario<T>[]>;
  
  /**
   * Delete scenario from storage
   * 
   * @param uuid Scenario UUID to delete
   * @param removeSymlinks Also remove symlinks (default true)
   */
  abstract scenarioDelete(uuid: string, removeSymlinks?: boolean): Promise<void>;
  
  /**
   * Check if scenario exists
   * 
   * @param uuid Scenario UUID to check
   */
  abstract scenarioExists(uuid: string): Promise<boolean>;
  
  // ═══════════════════════════════════════════════════════════════
  // Symlink Path Builders
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Build type symlink path
   * @returns Relative path like: type/ONCE/0.3.21.8
   */
  abstract typePathBuild(component: string, version: string): string;
  
  /**
   * Build domain symlink path with hostname
   * @param domainParts Array like ['box', 'fritz']
   * @param hostname Hostname like 'McDonges'
   * @returns Relative path like: domain/box/fritz/McDonges/ONCE/0.3.21.8
   */
  abstract domainPathBuild(domainParts: string[], hostname: string, component: string, version: string): string;
  
  /**
   * Build capability symlink path under domain
   * @param domainParts Array like ['box', 'fritz']
   * @param hostname Hostname like 'McDonges'
   * @returns Relative path like: domain/box/fritz/McDonges/ONCE/0.3.21.8/capability/httpPort/42777
   */
  abstract capabilityPathBuild(
    domainParts: string[], 
    hostname: string, 
    component: string, 
    version: string,
    capabilityType: string, 
    capabilityValue: string
  ): string;
}
