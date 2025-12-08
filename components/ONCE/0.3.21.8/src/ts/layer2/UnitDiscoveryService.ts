/**
 * UnitDiscoveryService - Discovers and creates unit scenarios for component files
 * 
 * ✅ Web4 Principle 4: Radical OOP
 * ✅ Web4 Principle 6: Empty constructor
 * ✅ Preparation for Unit component extraction in 0.4.0.0
 * 
 * @extract Unit/0.4.0.0
 * @pdca 2025-12-08-UTC-1200.unit-manifest-generation.pdca.md
 */

import { ScenarioService } from './ScenarioService.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { Model } from '../layer3/Model.interface.js';
import type { UnitDefinition, UnitFilePattern } from '../layer3/UnitDefinition.interface.js';
import type { ComponentManifest, ManifestUnit, ManifestUnits } from '../layer3/ComponentManifest.interface.js';
import { TypeM3 } from '../layer3/TypeM3.enum.js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Unit model for discovered files
 */
interface DiscoveredUnitModel extends Model {
  uuid: string;
  name: string;
  typeM3: TypeM3;
  origin: string;
  definition: string;
  filePath: string;
  mimetype: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Discovery result
 */
interface DiscoveryResult {
  definition: UnitDefinition;
  uuid: string;
  scenario: Scenario<DiscoveredUnitModel>;
  unitSymlinkPath: string;
}

/**
 * UnitDiscoveryService - Discovers, creates, and manages unit scenarios
 */
export class UnitDiscoveryService {
  
  private scenarioService: ScenarioService | null = null;
  private componentRoot: string = '';
  private componentName: string = '';
  private componentVersion: string = '';
  private projectRoot: string = '';
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {}
  
  /**
   * Initialize service
   */
  init(config: {
    scenarioService: ScenarioService;
    componentRoot: string;
    componentName: string;
    componentVersion: string;
    projectRoot: string;
  }): this {
    this.scenarioService = config.scenarioService;
    this.componentRoot = config.componentRoot;
    this.componentName = config.componentName;
    this.componentVersion = config.componentVersion;
    this.projectRoot = config.projectRoot;
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Unit Discovery
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Discover units in a directory by pattern
   */
  async unitsDiscover(
    directory: string,
    pattern: UnitFilePattern
  ): Promise<UnitDefinition[]> {
    const definitions: UnitDefinition[] = [];
    
    await this.scanDirectory(
      directory,
      pattern,
      definitions
    );
    
    return definitions;
  }
  
  /**
   * Scan directory for matching files
   */
  private async scanDirectory(
    directory: string,
    pattern: UnitFilePattern,
    results: UnitDefinition[]
  ): Promise<void> {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (pattern.excludeDirs?.includes(entry.name)) {
          continue;
        }
        
        if (pattern.recursive) {
          await this.scanDirectory(fullPath, pattern, results);
        }
      } else if (entry.isFile()) {
        // Check if file matches pattern
        if (this.matchesPattern(entry.name, pattern.glob)) {
          const relativePath = path.relative(this.componentRoot, fullPath);
          
          // Check if .unit symlink already exists
          const unitPath = `${fullPath}.unit`;
          let existingUuid: string | undefined;
          
          if (fs.existsSync(unitPath)) {
            try {
              const stats = await fs.promises.lstat(unitPath);
              if (stats.isSymbolicLink()) {
                const target = await fs.promises.readlink(unitPath);
                const uuidMatch = target.match(/([0-9a-f-]{36})\.scenario\.json/);
                if (uuidMatch) {
                  existingUuid = uuidMatch[1];
                }
              }
            } catch {
              // Ignore errors
            }
          }
          
          results.push({
            filename: entry.name,
            relativePath,
            description: this.generateDescription(entry.name, pattern.typeM3),
            typeM3: pattern.typeM3,
            mimetype: pattern.mimetype,
            extension: path.extname(entry.name),
            existingUuid,
          });
        }
      }
    }
  }
  
  /**
   * Simple glob pattern matching
   */
  private matchesPattern(filename: string, glob: string): boolean {
    // Extract extension from glob (e.g., "**/*.css" -> ".css")
    const extMatch = glob.match(/\*\.(\w+)$/);
    if (extMatch) {
      return filename.endsWith(`.${extMatch[1]}`);
    }
    return false;
  }
  
  /**
   * Generate description based on file and type
   */
  private generateDescription(filename: string, typeM3: TypeM3): string {
    const baseName = path.basename(filename, path.extname(filename));
    
    switch (typeM3) {
      case TypeM3.CLASS:
        return `TypeScript ${baseName} class/interface`;
      case TypeM3.ATTRIBUTE:
        if (filename.endsWith('.css')) {
          return `CSS stylesheet for ${baseName}`;
        }
        if (filename.endsWith('.html')) {
          return `HTML template ${baseName}`;
        }
        return `Resource file ${baseName}`;
      default:
        return `Unit ${baseName}`;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Unit Creation
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a unit scenario for a file definition
   */
  async unitCreate(definition: UnitDefinition): Promise<DiscoveryResult> {
    if (!this.scenarioService) {
      throw new Error('UnitDiscoveryService not initialized');
    }
    
    // Use existing UUID or generate new
    const uuid = definition.existingUuid || crypto.randomUUID();
    const now = new Date().toISOString();
    
    const model: DiscoveredUnitModel = {
      uuid,
      name: definition.filename,
      typeM3: definition.typeM3,
      origin: `ior:git:github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/${this.componentName}/${this.componentVersion}/${definition.relativePath}`,
      definition: definition.description,
      filePath: definition.relativePath,
      mimetype: definition.mimetype,
      createdAt: now,
      updatedAt: now,
    };
    
    // Create scenario via ScenarioService
    const scenario = this.scenarioService.scenarioCreate<DiscoveredUnitModel>({
      uuid,
      model,
      owner: 'system',
      symlinkPaths: [
        this.scenarioService.typePathBuild('Unit', this.componentVersion),
      ],
    });
    
    // Calculate unit symlink path
    const unitSymlinkPath = path.join(this.componentRoot, `${definition.relativePath}.unit`);
    
    return {
      definition,
      uuid,
      scenario,
      unitSymlinkPath,
    };
  }
  
  /**
   * Save unit scenario and create symlink
   */
  async unitSave(result: DiscoveryResult): Promise<void> {
    if (!this.scenarioService) {
      throw new Error('UnitDiscoveryService not initialized');
    }
    
    // Build symlink paths
    const componentUnitPath = `components/${this.componentName}/${this.componentVersion}/${result.definition.relativePath}.unit`;
    
    // Save scenario
    await this.scenarioService.scenarioSave(result.scenario, [
      this.scenarioService.typePathBuild('Unit', this.componentVersion),
      componentUnitPath,
    ]);
    
    // Create symlink in component directory
    const scenarioIndexPath = path.join(
      this.projectRoot,
      'scenarios',
      'index',
      this.scenarioService.indexPathBuild(result.uuid)
    );
    
    // Calculate relative path from unit location to scenario
    const unitDir = path.dirname(result.unitSymlinkPath);
    const relativePath = path.relative(unitDir, scenarioIndexPath);
    
    // Ensure directory exists
    await fs.promises.mkdir(unitDir, { recursive: true });
    
    // Remove existing if present
    if (fs.existsSync(result.unitSymlinkPath)) {
      await fs.promises.unlink(result.unitSymlinkPath);
    }
    
    // Create symlink
    await fs.promises.symlink(relativePath, result.unitSymlinkPath);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Manifest Generation
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Generate manifest units section from discovered units
   */
  async manifestUnitsGenerate(): Promise<ManifestUnits> {
    const units: ManifestUnits = {
      css: [],
      templates: [],
      typescript: [],
    };
    
    // Scan for existing .unit symlinks
    await this.collectManifestUnits(this.componentRoot, units);
    
    return units;
  }
  
  /**
   * Collect manifest units from directory tree
   */
  private async collectManifestUnits(
    directory: string,
    units: ManifestUnits
  ): Promise<void> {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
          continue;
        }
        await this.collectManifestUnits(fullPath, units);
      } else if (entry.isSymbolicLink() && entry.name.endsWith('.unit')) {
        // Found a .unit symlink
        const manifestUnit = await this.parseUnitSymlink(fullPath, entry.name);
        if (manifestUnit) {
          // Categorize by file type
          const originalFile = entry.name.replace('.unit', '');
          if (originalFile.endsWith('.css')) {
            units.css.push(manifestUnit);
          } else if (originalFile.endsWith('.html')) {
            units.templates.push(manifestUnit);
          } else if (originalFile.endsWith('.ts')) {
            units.typescript?.push(manifestUnit);
          }
        }
      }
    }
  }
  
  /**
   * Parse a .unit symlink to extract manifest unit info
   */
  private async parseUnitSymlink(
    symlinkPath: string,
    symlinkName: string
  ): Promise<ManifestUnit | null> {
    try {
      const target = await fs.promises.readlink(symlinkPath);
      const uuidMatch = target.match(/([0-9a-f-]{36})\.scenario\.json/);
      
      if (!uuidMatch) {
        return null;
      }
      
      const uuid = uuidMatch[1];
      const originalName = symlinkName.replace('.unit', '');
      const relativePath = path.relative(this.componentRoot, symlinkPath);
      const originalPath = relativePath.replace('.unit', '');
      
      return {
        uuid,
        name: originalName,
        path: originalPath,
        unitPath: relativePath,
        mimetype: this.getMimeType(originalName),
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Get MIME type from filename
   */
  private getMimeType(filename: string): string {
    if (filename.endsWith('.css')) return 'text/css';
    if (filename.endsWith('.html')) return 'text/html';
    if (filename.endsWith('.ts')) return 'application/typescript';
    if (filename.endsWith('.js')) return 'application/javascript';
    if (filename.endsWith('.json')) return 'application/json';
    return 'application/octet-stream';
  }
  
  /**
   * Update component manifest file with discovered units
   */
  async manifestUpdate(manifestPath: string): Promise<void> {
    // Read existing manifest
    let manifest: ComponentManifest;
    
    if (fs.existsSync(manifestPath)) {
      const content = await fs.promises.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(content);
    } else {
      // Create new manifest
      manifest = {
        ior: {
          uuid: crypto.randomUUID(),
          component: 'Web4TSComponent',
          version: this.componentVersion,
        },
        owner: 'system',
        model: {
          uuid: crypto.randomUUID(),
          name: this.componentName,
          version: this.componentVersion,
          description: `${this.componentName} Web4 Component`,
          units: { css: [], templates: [] },
        },
      };
    }
    
    // Update units section
    manifest.model.units = await this.manifestUnitsGenerate();
    
    // Write back
    await fs.promises.writeFile(
      manifestPath,
      JSON.stringify(manifest, null, 2) + '\n'
    );
  }
}

