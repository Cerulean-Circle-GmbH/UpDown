/**
 * UcpStorage - Web4 compliant UUID index system for scenarios
 * 
 * Based on Unit's DefaultStorage pattern.
 * Stores scenarios in scenarios/index/ with UUID-based folder structure.
 * Creates symlinks in type/domain/capability views.
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 6: Empty Constructor + init()
 * ✅ Web4 Principle 19: One File One Type
 * ✅ Web4 Principle 24: Implements PersistenceManager for RelatedObjects lookup
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import type { Storage } from '../layer3/Storage.interface.js';
import type { PersistenceManager, ScenarioQuery } from '../layer3/PersistenceManager.interface.js';
import type { StorageScenario } from '../layer3/StorageScenario.interface.js';
import type { StorageModel } from '../layer3/StorageModel.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { Model } from '../layer3/Model.interface.js';
import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * UcpStorage - UUID index-based scenario storage
 * 
 * Implements both Storage and PersistenceManager interfaces.
 * Register in RelatedObjects for lookup by any component.
 * 
 * Storage Structure:
 * ```
 * scenarios/
 * ├── index/{a}/{b}/{c}/{d}/{e}/{uuid}.scenario.json  # PRIMARY
 * ├── type/{Component}/{version}/...                   # SYMLINKS
 * ├── domain/{domain}/{Component}/{version}/...        # SYMLINKS
 * └── capability/{type}/{value}/...                    # SYMLINKS
 * ```
 * 
 * Usage with RelatedObjects:
 * ```typescript
 * // Register
 * import { PersistenceManager } from '../layer3/PersistenceManager.interface.js';
 * controller.relatedObjectRegister(PersistenceManager, storage);
 * 
 * // Lookup
 * const pm = controller.relatedObjectLookup(PersistenceManager);
 * ```
 */
export class UcpStorage implements Storage {
  
  /** Storage model state */
  private model: StorageModel;
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    this.model = {
      uuid: crypto.randomUUID(),
      projectRoot: '',
      indexBaseDir: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Initialize storage with scenario
   * @param scenario Storage scenario with model
   * @returns this for chaining
   */
  init(scenario: StorageScenario): this {
    if (scenario.model) {
      this.model = scenario.model;
    }
    
    // Only discover paths if not provided in scenario
    // This allows tests to provide custom paths
    if (!this.model.projectRoot) {
      this.model.projectRoot = this.projectRootFind();
    }
    if (!this.model.indexBaseDir) {
      this.model.indexBaseDir = join(this.model.projectRoot, 'scenarios', 'index');
    }
    
    this.model.updatedAt = new Date().toISOString();
    return this;
  }
  
  /**
   * Save scenario to UUID index with symlinks
   */
  async scenarioSave<T extends Model>(
    uuid: string, 
    scenario: Scenario<T>, 
    symlinkPaths: string[]
  ): Promise<void> {
    // Create UUID folder structure (5 levels deep)
    const folderPath = this.uuidFolderPathGenerate(uuid);
    await fs.mkdir(folderPath, { recursive: true });

    // Create scenario file path
    const scenarioPath = join(folderPath, `${uuid}.scenario.json`);

    // Update scenario model with storage data
    const scenarioWithStorage = {
      ...scenario,
      model: {
        ...scenario.model,
        indexPath: scenarioPath,
        symlinkPaths,
        updatedAt: new Date().toISOString()
      }
    };

    // Save scenario to index
    await fs.writeFile(scenarioPath, JSON.stringify(scenarioWithStorage, null, 2), 'utf-8');
    console.log(`[UcpStorage] Saved scenario to: ${scenarioPath}`);

    // Create symbolic links - linkPath is relative like "type/Component/version"
    // Full path: {projectRoot}/scenarios/{linkPath}/{uuid}.scenario.json
    for (const linkPath of symlinkPaths) {
      const fullLinkPath = join(
        this.model.projectRoot, 
        'scenarios', 
        linkPath, 
        `${uuid}.scenario.json`
      );
      await this.symlinkCreate(scenarioPath, fullLinkPath);
    }
  }
  
  /**
   * Load scenario from UUID index
   */
  async scenarioLoad<T extends Model>(uuid: string): Promise<Scenario<T>> {
    const scenarioPath = this.scenarioIndexPathGet(uuid);
    const content = await fs.readFile(scenarioPath, 'utf-8');
    return JSON.parse(content);
  }
  
  /**
   * Find scenarios by query
   */
  async scenarioFind<T extends Model>(query: ScenarioQuery): Promise<Scenario<T>[]> {
    const results: Scenario<T>[] = [];
    
    // Build search path based on query
    let searchPath: string;
    
    if (query.domain) {
      searchPath = join(this.model.projectRoot, 'scenarios', 'domain', query.domain);
      if (query.component) {
        searchPath = join(searchPath, query.component);
        if (query.version) {
          searchPath = join(searchPath, query.version);
        }
      }
    } else if (query.component) {
      searchPath = join(this.model.projectRoot, 'scenarios', 'type', query.component);
      if (query.version) {
        searchPath = join(searchPath, query.version);
      }
    } else if (query.capabilityType && query.capabilityValue) {
      searchPath = join(
        this.model.projectRoot, 'scenarios', 'capability',
        query.capabilityType, query.capabilityValue
      );
    } else {
      // Search entire index
      searchPath = this.model.indexBaseDir;
    }
    
    // Find all .scenario.json files
    if (existsSync(searchPath)) {
      const files = await this.scenarioFilesFind(searchPath);
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          results.push(JSON.parse(content));
        } catch (error) {
          console.warn(`[UcpStorage] Failed to load: ${file}`, error);
        }
      }
    }
    
    return results;
  }
  
  /**
   * Delete scenario from storage
   * Removes index file and optionally all symlinks
   */
  async scenarioDelete(uuid: string, removeSymlinks: boolean = true): Promise<void> {
    const scenarioPath = this.scenarioIndexPathGet(uuid);
    
    // Load scenario to get symlink paths
    if (removeSymlinks) {
      try {
        const scenario = await this.scenarioLoad(uuid);
        const symlinkPaths = (scenario.model as any)?.symlinkPaths || [];
        
        // Remove symlinks
        for (const linkPath of symlinkPaths) {
          try {
            await fs.unlink(linkPath);
            console.log(`[UcpStorage] Removed symlink: ${linkPath}`);
          } catch {
            // Ignore if already deleted
          }
        }
      } catch {
        // Scenario doesn't exist or can't be loaded
      }
    }
    
    // Remove index file
    try {
      await fs.unlink(scenarioPath);
      console.log(`[UcpStorage] Deleted scenario: ${scenarioPath}`);
    } catch {
      // Ignore if already deleted
    }
  }
  
  /**
   * Check if scenario exists in storage
   */
  async scenarioExists(uuid: string): Promise<boolean> {
    const scenarioPath = this.scenarioIndexPathGet(uuid);
    return existsSync(scenarioPath);
  }
  
  /**
   * Convert storage to scenario for hibernation
   */
  async toScenario(): Promise<StorageScenario> {
    const componentVersion = await this.componentVersionGet();
    const componentName = await this.componentNameGet();
    
    const ownerData = JSON.stringify({
      user: process.env.USER || 'system',
      hostname: process.env.HOSTNAME || 'localhost',
      uuid: this.model.uuid,
      timestamp: new Date().toISOString(),
      component: componentName,
      version: componentVersion
    });

    return {
      ior: {
        uuid: this.model.uuid,
        component: componentName, 
        version: componentVersion
      },
      owner: ownerData,
      model: this.model
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // UUID Folder Structure
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Generate UUID folder path (5 levels deep)
   * e.g., 44443290-015c-... → scenarios/index/4/4/4/4/3/
   */
  private uuidFolderPathGenerate(uuid: string): string {
    const cleanUuid = uuid.replace(/-/g, '');
    const folderStructure = cleanUuid.substring(0, 5).split('');
    return join(this.model.indexBaseDir, ...folderStructure);
  }
  
  /**
   * Get scenario index path from UUID
   */
  private scenarioIndexPathGet(uuid: string): string {
    const folderPath = this.uuidFolderPathGenerate(uuid);
    return join(folderPath, `${uuid}.scenario.json`);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Symlink Management
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create symbolic link from index to view path
   */
  private async symlinkCreate(indexPath: string, symlinkPath: string): Promise<void> {
    // Ensure target directory exists
    await fs.mkdir(dirname(symlinkPath), { recursive: true });
    
    // Remove existing symlink if it exists
    try {
      await fs.unlink(symlinkPath);
    } catch {
      // Ignore if file doesn't exist
    }

    // Create relative path for symbolic link
    const relativePath = relative(dirname(symlinkPath), indexPath);
    
    // Create symbolic link
    await fs.symlink(relativePath, symlinkPath);
    console.log(`[UcpStorage] Created symlink: ${symlinkPath} → ${relativePath}`);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Find project root (directory containing scenarios/)
   */
  private projectRootFind(): string {
    let currentDir = process.cwd();
    
    while (currentDir !== '/') {
      if (existsSync(join(currentDir, 'scenarios'))) {
        return currentDir;
      }
      currentDir = dirname(currentDir);
    }
    return process.cwd();
  }
  
  /**
   * Find all .scenario.json files in directory (recursive)
   */
  private async scenarioFilesFind(dir: string): Promise<string[]> {
    const results: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Recurse into subdirectories
          const subResults = await this.scenarioFilesFind(fullPath);
          results.push(...subResults);
        } else if (entry.name.endsWith('.scenario.json')) {
          results.push(fullPath);
        } else if (entry.isSymbolicLink()) {
          // Follow symlinks
          const realPath = await fs.realpath(fullPath);
          if (realPath.endsWith('.scenario.json')) {
            results.push(realPath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return results;
  }
  
  /**
   * Get component version from package.json
   */
  private async componentVersionGet(): Promise<string> {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const packageJsonPath = path.resolve(currentDir, '../../../package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      return packageJson.version || '0.3.21.8';
    } catch (error) {
      return '0.3.21.8'; // Fallback version
    }
  }
  
  /**
   * Get component name from package.json
   */
  private async componentNameGet(): Promise<string> {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const packageJsonPath = path.resolve(currentDir, '../../../package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      return packageJson.name?.split('/').pop()?.replace('@web4/', '') || 'ONCE';
    } catch (error) {
      return 'ONCE'; // Fallback name
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Symlink Path Generators (convenience methods)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Generate type symlink path
   * @returns Path like: scenarios/type/{component}/{version}/{uuid}.scenario.json
   */
  typeLinkPathGenerate(component: string, version: string, uuid: string): string {
    return join(
      this.model.projectRoot, 'scenarios', 'type',
      component, version, `${uuid}.scenario.json`
    );
  }
  
  /**
   * Generate domain symlink path
   * @returns Path like: scenarios/domain/{domain}/{component}/{version}/{uuid}.scenario.json
   */
  domainLinkPathGenerate(domain: string, component: string, version: string, uuid: string): string {
    return join(
      this.model.projectRoot, 'scenarios', 'domain',
      domain, component, version, `${uuid}.scenario.json`
    );
  }
  
  /**
   * Generate capability symlink path
   * @returns Path like: scenarios/capability/{type}/{value}/{uuid}.scenario.json
   */
  capabilityLinkPathGenerate(capabilityType: string, capabilityValue: string, uuid: string): string {
    return join(
      this.model.projectRoot, 'scenarios', 'capability',
      capabilityType, capabilityValue, `${uuid}.scenario.json`
    );
  }
}

