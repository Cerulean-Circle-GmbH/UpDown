/**
 * ScenarioService - Single Point of Truth for Scenario Operations
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 4: Radical OOP (no functional save/load scattered)
 * ✅ Web4 Principle 6: Empty constructor
 * 
 * Purpose: Centralizes all scenario save/load/migrate operations
 * 
 * All scenario persistence MUST go through this service:
 * - UcpStorage → ScenarioService.scenarioSave()
 * - ServerHierarchyManager → ScenarioService.scenarioSave()
 * - ScenarioManager → ScenarioService (migration path)
 * 
 * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
 */

import type { Scenario } from '../layer3/Scenario.interface.js';
import type { Model } from '../layer3/Model.interface.js';
import type { ScenarioUnit } from '../layer3/ScenarioUnit.interface.js';
import type { UnitReference } from '../layer3/UnitReference.interface.js';
import type { PersistenceManager } from '../layer3/PersistenceManager.interface.js';
import type { Reference } from '../layer3/Reference.interface.js';
import type { UcpComponent } from './UcpComponent.js';
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import { SCENARIO_SCHEMA_VERSION, SCENARIO_SCHEMA_VERSION_LEGACY } from '../layer3/ScenarioUnit.interface.js';

/**
 * Migration method signature for convention-based upgrades
 * Method name: upgradeScenarioFromX_Y_Z where X_Y_Z is the source version
 */
export type ScenarioMigrationMethod<T extends Model = Model> = (scenario: Scenario<T>) => Scenario<T>;

/**
 * ScenarioService - Centralized scenario management
 * 
 * Single point of truth for:
 * - Scenario creation with proper unit metadata
 * - Scenario saving with reference tracking
 * - Scenario loading with auto-migration
 * - Reference synchronization
 * 
 * Migration Convention (Radical OOP):
 * - NO central SchemaMigrator class
 * - Each component version implements: upgradeScenarioFromX_Y_Z()
 * - Chain: 0.3.21.5 → 0.3.21.6 → 0.3.21.7 → 0.3.21.8
 */
export class ScenarioService {
  
  /** Persistence manager instance (set via init) */
  private persistenceManager: Reference<PersistenceManager> = null;
  
  /** Component instance for convention-based migrations */
  private component: Reference<UcpComponent<Model>> = null;
  
  /** Component name for created scenarios */
  private componentName: string = 'ONCE';
  
  /** Component version for created scenarios */
  private componentVersion: string = '0.3.21.8';
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {}
  
  /**
   * Initialize service with persistence manager and component
   */
  init(config: {
    persistenceManager: PersistenceManager;
    component?: UcpComponent<Model>;
    componentName?: string;
    componentVersion?: string;
  }): this {
    this.persistenceManager = config.persistenceManager;
    this.component = config.component ?? null;
    if (config.componentName) this.componentName = config.componentName;
    if (config.componentVersion) this.componentVersion = config.componentVersion;
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Scenario Creation
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a new scenario with proper unit metadata
   */
  scenarioCreate<T extends Model>(config: {
    uuid: string;
    model: T;
    owner: string;
    symlinkPaths?: string[];
  }): Scenario<T> {
    const now = new Date().toISOString();
    
    return {
      ior: {
        uuid: config.uuid,
        component: this.componentName,
        version: this.componentVersion,
      },
      owner: config.owner,
      model: config.model,
      unit: {
        indexPath: this.indexPathBuild(config.uuid),
        symlinkPaths: config.symlinkPaths || [],
        references: [],
        schemaVersion: SCENARIO_SCHEMA_VERSION,
        createdBy: `${this.componentName}/${this.componentVersion}`,
        createdAt: now,
        updatedAt: now,
      },
    };
  }
  
  /**
   * Build index path from UUID
   */
  indexPathBuild(uuid: string): string {
    const parts = uuid.split('-')[0].split('');
    return `${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}/${parts[4]}/${uuid}.scenario.json`;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Scenario Persistence
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Save scenario with unit metadata and reference tracking
   * SINGLE POINT OF TRUTH for all scenario saves
   */
  async scenarioSave<T extends Model>(
    scenario: Scenario<T>,
    symlinkPaths: string[] = []
  ): Promise<void> {
    if (!this.persistenceManager) {
      throw new Error('ScenarioService: persistenceManager not initialized');
    }
    
    // Ensure scenario has unit metadata
    const scenarioWithUnit = this.unitEnsure(scenario, symlinkPaths);
    
    // Update unit metadata
    scenarioWithUnit.unit!.updatedAt = new Date().toISOString();
    scenarioWithUnit.unit!.symlinkPaths = [
      ...new Set([...scenarioWithUnit.unit!.symlinkPaths, ...symlinkPaths])
    ];
    
    // Save via persistence manager
    await this.persistenceManager.scenarioSave(
      scenario.ior.uuid,
      scenarioWithUnit,
      symlinkPaths
    );
  }
  
  /**
   * Load scenario with auto-migration
   * SINGLE POINT OF TRUTH for all scenario loads
   */
  async scenarioLoad<T extends Model>(uuid: string): Promise<Scenario<T>> {
    if (!this.persistenceManager) {
      throw new Error('ScenarioService: persistenceManager not initialized');
    }
    
    const scenario = await this.persistenceManager.scenarioLoad<T>(uuid);
    
    // Auto-migrate if needed
    return this.scenarioMigrate(scenario);
  }
  
  /**
   * Delete scenario and its references
   */
  async scenarioDelete(uuid: string, removeSymlinks: boolean = true): Promise<void> {
    if (!this.persistenceManager) {
      throw new Error('ScenarioService: persistenceManager not initialized');
    }
    
    await this.persistenceManager.scenarioDelete(uuid, removeSymlinks);
  }
  
  /**
   * Check if scenario exists
   */
  async scenarioExists(uuid: string): Promise<boolean> {
    if (!this.persistenceManager) {
      throw new Error('ScenarioService: persistenceManager not initialized');
    }
    
    return this.persistenceManager.scenarioExists(uuid);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Schema Migration (Convention-Based)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Migrate scenario to current version using convention-based methods
   * 
   * Convention: Component implements upgradeScenarioFromX_Y_Z()
   * Example: upgradeScenarioFrom0_3_21_7() for migrating from 0.3.21.7
   * 
   * Called automatically on load
   */
  scenarioMigrate<T extends Model>(scenario: Scenario<T>): Scenario<T> {
    // Get source version from scenario
    const sourceVersion = scenario.ior.version;
    
    // Already at current version?
    if (sourceVersion === this.componentVersion) {
      // Still ensure unit metadata exists
      if (!scenario.unit) {
        return this.unitAdd(scenario);
      }
      return scenario;
    }
    
    // No unit = legacy schema, add unit first
    if (!scenario.unit) {
      scenario = this.unitAdd(scenario);
    }
    
    // Try convention-based migration
    const migrated = this.migrateViaConvention(scenario, sourceVersion);
    
    // Update version in IOR
    migrated.ior.version = this.componentVersion;
    migrated.unit!.updatedAt = new Date().toISOString();
    
    return migrated;
  }
  
  /**
   * Try to migrate via convention-based method on component
   * Looks for: upgradeScenarioFromX_Y_Z() where X_Y_Z is the source version
   */
  private migrateViaConvention<T extends Model>(
    scenario: Scenario<T>,
    sourceVersion: string
  ): Scenario<T> {
    if (!this.component) {
      // No component provided, return as-is with unit metadata
      return scenario;
    }
    
    // Build method name: upgradeScenarioFrom0_3_21_7 for version 0.3.21.7
    const methodName = `upgradeScenarioFrom${sourceVersion.replace(/\./g, '_')}`;
    
    // Check if component has this method
    const migrationMethod = (this.component as unknown as Record<string, ScenarioMigrationMethod<T>>)[methodName];
    
    if (typeof migrationMethod === 'function') {
      console.log(`ScenarioService: Migrating scenario via ${methodName}()`);
      return migrationMethod.call(this.component, scenario);
    }
    
    // No migration method found - log warning but continue
    console.warn(`ScenarioService: No migration method ${methodName}() found on component`);
    return scenario;
  }
  
  /**
   * Add unit metadata to legacy scenario (no unit field)
   */
  private unitAdd<T extends Model>(scenario: Scenario<T>): Scenario<T> {
    const now = new Date().toISOString();
    
    return {
      ...scenario,
      unit: {
        indexPath: this.indexPathBuild(scenario.ior.uuid),
        symlinkPaths: [],
        references: [],
        schemaVersion: SCENARIO_SCHEMA_VERSION,
        createdBy: `${this.componentName}/${this.componentVersion}`,
        createdAt: now,
        updatedAt: now,
      },
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Unit Metadata
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Ensure scenario has unit metadata
   */
  private unitEnsure<T extends Model>(
    scenario: Scenario<T>,
    symlinkPaths: string[] = []
  ): Scenario<T> {
    if (scenario.unit) {
      return scenario;
    }
    
    const now = new Date().toISOString();
    
    return {
      ...scenario,
      unit: {
        indexPath: this.indexPathBuild(scenario.ior.uuid),
        symlinkPaths: symlinkPaths,
        references: [],
        schemaVersion: SCENARIO_SCHEMA_VERSION,
        createdBy: `${this.componentName}/${this.componentVersion}`,
        createdAt: now,
        updatedAt: now,
      },
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Reference Tracking
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Track a reference to a scenario
   */
  referenceTrack<T extends Model>(
    scenario: Scenario<T>,
    linkLocation: string,
    linkTarget: string
  ): Scenario<T> {
    if (!scenario.unit) {
      scenario = this.unitEnsure(scenario);
    }
    
    const existingRef = scenario.unit!.references.find(
      r => r.linkLocation === linkLocation
    );
    
    if (existingRef) {
      existingRef.linkTarget = linkTarget;
      existingRef.syncStatus = SyncStatus.SYNCED;
    } else {
      scenario.unit!.references.push({
        linkLocation,
        linkTarget,
        syncStatus: SyncStatus.SYNCED,
      });
    }
    
    scenario.unit!.updatedAt = new Date().toISOString();
    
    return scenario;
  }
  
  /**
   * Create a unit reference object
   */
  referenceCreate(linkLocation: string, uuid: string): UnitReference {
    return {
      linkLocation,
      linkTarget: `ior:unit:${uuid}`,
      syncStatus: SyncStatus.SYNCED,
    };
  }
  
  /**
   * Mark a reference as broken (target no longer valid)
   */
  referenceBroken<T extends Model>(
    scenario: Scenario<T>,
    linkLocation: string
  ): Scenario<T> {
    if (!scenario.unit) return scenario;
    
    const ref = scenario.unit.references.find(
      r => r.linkLocation === linkLocation
    );
    
    if (ref) {
      ref.syncStatus = SyncStatus.BROKEN;
      scenario.unit.updatedAt = new Date().toISOString();
    }
    
    return scenario;
  }
}

/**
 * Default ScenarioService instance (singleton pattern)
 * Use this for most operations, or create new instance for custom config
 */
export const scenarioService = new ScenarioService();

