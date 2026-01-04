/**
 * Web4TSComponent - Web4 TypeScript Component Interface
 * 
 * Extends base component with development methods (test, build, clean, tree, links)
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import type { Scenario } from './Scenario.interface.js';
import type { Web4TSComponentModel } from './Web4TSComponentModel.interface.js';

/**
 * Web4TSComponent interface - Development component methods
 * Note: 'model' is accessed via getter from UcpComponent (protected internally)
 */
export interface Web4TSComponent {
  
  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE METHODS (from UcpComponent)
  // ═══════════════════════════════════════════════════════════════
  
  /** Initialize with scenario */
  init(scenario?: Scenario<Web4TSComponentModel>): this | Promise<this>;
  
  /** Convert to scenario for persistence */
  toScenario(name?: string): Promise<Scenario<Web4TSComponentModel>>;
  
  // ═══════════════════════════════════════════════════════════════
  // DEVELOPMENT METHODS (TypeScript Component Specific)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Run component tests (full suite or selective)
   * @param scope Test scope: 'all' | 'file' | 'describe' | 'itCase'
   * @param references Hierarchical test references
   */
  test(scope?: string, ...references: string[]): Promise<this>;
  
  /**
   * Build component (TypeScript compilation)
   * After build, creates unit scenarios for new files
   */
  build(...flags: string[]): Promise<this>;
  
  /**
   * Clean component build artifacts
   */
  clean(): Promise<this>;
  
  /**
   * Show component directory tree structure
   * @param depth Maximum depth to show
   * @param showHidden Whether to show hidden files
   */
  tree?(depth?: string, showHidden?: string): Promise<this>;
  
  /**
   * Show semantic version links (dev, test, prod, latest)
   * @param action Optional action (e.g., 'repair')
   */
  links?(action?: string): Promise<this>;
  
  // ═══════════════════════════════════════════════════════════════
  // WEB4TSCOMPONENT SPECIFIC METHODS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Generate location-resilient CLI wrapper
   */
  cliWrapperGenerate(componentName: string, version: string): Promise<string>;
  
  /**
   * Set target directory for component operations
   */
  targetDirectorySet(directory: string): void;
  
  // ═══════════════════════════════════════════════════════════════
  // UNIT CREATION (NEW - integrated from UnitDiscoveryService)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Discover and create units for component files
   * Called automatically after build()
   */
  unitsDiscover(): Promise<this>;
  
  /**
   * Generate component.json scenario file (replaces manifestUpdate)
   * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
   */
  componentDescriptorUpdate(): Promise<this>;
  
  /**
   * Read component descriptor from component.json
   */
  componentDescriptorRead(componentName: string, version: string): Promise<any>;
  
  /**
   * Start a component (ensures it's built and ready for import)
   */
  componentStart(componentName: string, version: string): Promise<this>;
}

