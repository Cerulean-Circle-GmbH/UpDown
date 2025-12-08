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
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import { SCENARIO_SCHEMA_VERSION, SCENARIO_SCHEMA_VERSION_LEGACY } from '../layer3/ScenarioUnit.interface.js';

/**
 * ScenarioService - Centralized scenario management
 * 
 * Single point of truth for:
 * - Scenario creation with proper unit metadata
 * - Scenario saving with reference tracking
 * - Scenario loading with auto-migration
 * - Reference synchronization
 */
export class ScenarioService {
  
  /** Persistence manager instance (set via init) */
  private persistenceManager: Reference<PersistenceManager> = null;
  
  /** Component name for created scenarios */
  private componentName: string = 'ONCE';
  
  /** Component version for created scenarios */
  private componentVersion: string = '0.3.21.8';
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {}
  
  /**
   * Initialize service with persistence manager
   */
  init(config: {
    persistenceManager: PersistenceManager;
    componentName?: string;
    componentVersion?: string;
  }): this {
    this.persistenceManager = config.persistenceManager;
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
  // Schema Migration
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Migrate scenario to current schema version
   * Called automatically on load
   */
  scenarioMigrate<T extends Model>(scenario: Scenario<T>): Scenario<T> {
    // Check if migration needed
    if (scenario.unit?.schemaVersion === SCENARIO_SCHEMA_VERSION) {
      return scenario;
    }
    
    // No unit = legacy schema
    if (!scenario.unit) {
      return this.migrateFromLegacy(scenario);
    }
    
    // Future: Add version-specific migrations here
    // if (scenario.unit.schemaVersion === '1.1.0') { ... }
    
    return scenario;
  }
  
  /**
   * Migrate from legacy (no unit) to current schema
   */
  private migrateFromLegacy<T extends Model>(scenario: Scenario<T>): Scenario<T> {
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

