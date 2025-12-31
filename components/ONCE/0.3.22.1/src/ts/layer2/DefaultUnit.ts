/**
 * DefaultUnit.ts - Unit Component Implementation
 * 
 * INSOURCED from Unit/0.3.0.5 with Web4 principle compliance.
 * 
 * A Unit represents an instance of a component with its scenario data.
 * Created by UcpComponent.scenarioCreate() for all components.
 * 
 * Web4 Principles:
 * - P1: Everything is a Scenario - Units ARE scenarios
 * - P4: Radical OOP - Unit IS a UcpComponent
 * - P4a: No arrow functions
 * - P6: Empty constructor, init pattern
 * - P7: Layer 2 sync methods
 * - P24: RelatedObjects for artefact/file references
 * - P29: IDProvider pattern - this.uuidCreate() NOT crypto.randomUUID()
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultUnit
 * @master Unit/0.3.0.5/src/ts/layer2/DefaultUnit.ts
 * @pdca 2025-12-21-UTC-2100.defaultunit-inline-migration.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { UnitModel } from '../layer3/UnitModel.interface.js';
import { UnitReference } from '../layer3/UnitReference.interface.js';
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import { TypeM3 } from '../layer3/TypeM3.enum.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { Reference } from '../layer3/Reference.interface.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync, readlinkSync } from 'fs';
import { dirname } from 'path';
import { IOR } from '../layer4/IOR.js';  // FsM.4: IOR-based unit ops

// Type for unit identifier (UUID string or .unit file path)
type UnitIdentifier = string;

/**
 * Check if string is a valid UUIDv4
 */
function isUUIDv4(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * DefaultUnit - Unit component implementation
 * 
 * Insourced from Unit/0.3.0.5 with Web4 compliance fixes.
 * Extends UcpComponent for full ONCE integration.
 */
export class DefaultUnit extends UcpComponent<UnitModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // Model Default (P6: Empty Constructor Pattern)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Provide default model values matching Unit/0.3.0.5 MASTER
   */
  protected modelDefault(): UnitModel {
    return {
      uuid: this.uuidCreate(),  // P29: IDProvider pattern
      name: '',
      origin: '',
      definition: '',
      typeM3: TypeM3.CLASS,
      indexPath: '',
      references: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Model Accessors (P16: TypeScript Accessors)
  // ═══════════════════════════════════════════════════════════════
  
  get originName(): string {
    if (!this.model) return '';
    return this.originNameExtract();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ONCE-specific Methods (for UcpComponent integration)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize Unit for a component (ONCE extension)
   * Used by UcpComponent.scenarioCreate()
   */
  initForComponent(
    componentType: string,
    componentIor: string,
    fileUuid?: string
  ): void {
    this.model.componentType = componentType;
    this.model.componentIor = componentIor;
    this.model.fileUuid = fileUuid || null;
    this.model.name = `${componentType}-${this.model.uuid.substring(0, 8)}`;
  }
  
  /**
   * Link this Unit to an Artefact (ONCE extension)
   */
  artefactLink(artefactUuid: string): void {
    this.model.artefactUuid = artefactUuid;
    this.model.updatedAt = new Date().toISOString();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Core Methods (from Unit/0.3.0.5)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Validate unit model completeness
   */
  async validateModel(): Promise<boolean> {
    try {
      if (!this.model.uuid || typeof this.model.uuid !== 'string') return false;
      if (!this.model.name || typeof this.model.name !== 'string') return false;
      if (!this.model.origin || typeof this.model.origin !== 'string') return false;
      if (!this.model.definition || typeof this.model.definition !== 'string') return false;
      if (!this.model.indexPath || typeof this.model.indexPath !== 'string') return false;
      
      if (this.model.typeM3 && !Object.values(TypeM3).includes(this.model.typeM3)) return false;
      if (!Array.isArray(this.model.references)) return false;
      if (!this.model.createdAt || isNaN(Date.parse(this.model.createdAt))) return false;
      if (!this.model.updatedAt || isNaN(Date.parse(this.model.updatedAt))) return false;
      
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Create unit from file or folder
   * 
   * @param pathInput File or folder path
   * @param startPos Optional start position for word-in-file
   * @param endPos Optional end position for word-in-file
   */
  async from(pathInput: string, startPos?: string, endPos?: string): Promise<this> {
    try {
      const projectRoot = this.projectRootFind();
      const fullPath = path.isAbsolute(pathInput) ? pathInput : path.join(projectRoot, pathInput);
      
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        await this.folderUnitCreate(pathInput);
      } else {
        if (startPos && endPos) {
          await this.wordInFileUnitCreate(pathInput, startPos, endPos);
        } else {
          await this.fileUnitCreate(pathInput);
        }
      }
      
      return this;
    } catch (error) {
      console.error(`Failed to create unit from file: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Create link to unit
   * 
   * @param identifier Unit UUID or .unit file
   * @param filename Target filename for link
   */
  async link(identifier: UnitIdentifier, filename: string): Promise<this> {
    try {
      const uuid = this.uuidFromIdentifier(identifier);
      const convertedFilename = filename.replace(/\s+/g, '.');
      const currentDir = process.cwd();
      const linkPath = `${currentDir}/${convertedFilename}.unit`;
      
      // Load existing unit scenario
      const existingScenario = await this.scenarioLoad(uuid);
      
      // Update scenario with new link
      existingScenario.model.references.push({
        linkLocation: `ior:local:ln:file:${linkPath}`,
        linkTarget: `ior:unit:${uuid}`,
        syncStatus: SyncStatus.SYNCED
      });
      
      const scenarioPath = existingScenario.model.indexPath;
      const relativePath = path.relative(currentDir, scenarioPath);
      await fs.symlink(relativePath, linkPath);
      
      await this.scenarioSave(uuid, existingScenario);
      
      console.log(`✅ Link created: ${convertedFilename}.unit → ${uuid}`);
      return this;
    } catch (error) {
      console.error(`Failed to create link: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Create link to unit in target folder
   * 
   * @param unit Unit UUID or .unit file
   * @param folder Target folder path
   */
  async linkInto(unit: UnitIdentifier, folder: string): Promise<this> {
    try {
      const uuid = this.uuidFromIdentifier(unit);
      const scenario = await this.scenarioLoad(uuid);
      const linkFilename = this.nameToFilename(scenario.model.name) + '.unit';
      
      const targetPath = path.resolve(folder);
      const newLinkPath = `${targetPath}/${linkFilename}`;
      
      await fs.mkdir(targetPath, { recursive: true });
      
      const relativePath = path.relative(targetPath, scenario.model.indexPath);
      await fs.symlink(relativePath, newLinkPath);
      
      if (!scenario.model.references) {
        scenario.model.references = [];
      }
      scenario.model.references.push({
        linkLocation: `ior:local:ln:file:${newLinkPath}`,
        linkTarget: `ior:unit:${uuid}`,
        syncStatus: SyncStatus.SYNCED
      });
      scenario.model.updatedAt = new Date().toISOString();
      
      await this.scenarioSave(uuid, scenario);
      
      console.log(`✅ Link created in target folder: ${linkFilename}`);
      console.log(`   Unit: ${scenario.model.name} (${uuid})`);
      console.log(`   Target: ${newLinkPath}`);
      
      return this;
    } catch (error) {
      console.error(`Failed to create link: ${(error as Error).message}`);
      throw error;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Private Helper Methods (P4a: No Arrow Functions)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Extract origin name from IOR
   */
  private originNameExtract(): string {
    if (!this.model.origin) return '';
    
    const filePath = this.filePathFromIOR(this.model.origin);
    if (!filePath) return '';
    
    if (filePath.endsWith('/')) {
      const folderPath = filePath.slice(0, -1);
      return path.basename(folderPath);
    }
    
    return path.basename(filePath);
  }
  
  /**
   * Extract file path from IOR string
   */
  private filePathFromIOR(ior: string): string | null {
    const match = ior.match(/ior:git:github\.com\/Cerulean-Circle-GmbH\/[^/]+\/blob\/[^/]+\/(.+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Find project root by looking for scenarios directory
   */
  private projectRootFind(): string {
    let currentDir = process.cwd();
    
    while (currentDir !== '/') {
      if (existsSync(`${currentDir}/scenarios`)) {
        return currentDir;
      }
      currentDir = dirname(currentDir);
    }
    return process.cwd();
  }
  
  /**
   * Build index path from UUID (5-level structure)
   */
  private indexPathBuild(uuid: string): string {
    return path.join(uuid[0], uuid[1], uuid[2], uuid[3], uuid[4]);
  }
  
  /**
   * Get scenario path for current unit
   */
  private async scenarioPathGet(): Promise<string> {
    const projectRoot = this.projectRootFind();
    const indexPath = this.indexPathBuild(this.model.uuid);
    return path.join(projectRoot, 'scenarios', 'index', indexPath, `${this.model.uuid}.scenario.json`);
  }
  
  /**
   * Extract UUID from unit identifier
   */
  private uuidFromIdentifier(identifier: UnitIdentifier): string {
    if (isUUIDv4(identifier)) {
      return identifier;
    }
    
    // File path - extract UUID from symlink target
    const currentDir = process.cwd();
    const linkPath = path.resolve(currentDir, identifier);
    const scenarioPath = readlinkSync(linkPath);
    return this.uuidFromPath(scenarioPath);
  }
  
  /**
   * Extract UUID from scenario path
   */
  private uuidFromPath(scenarioPath: string): string {
    const pathParts = scenarioPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    return filename.replace('.scenario.json', '');
  }
  
  /**
   * Convert name to filename (spaces to dots)
   */
  private nameToFilename(name: string): string {
    if (!name) return 'unnamed';
    
    return name
      .replace(/\s+/g, '.')
      .replace(/[^A-Za-z0-9.-]/g, '')
      .replace(/\.+/g, '.')
      .replace(/^\.+|\.+$/g, '');
  }
  
  /**
   * Check if string is UUID
   */
  private stringIsUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
  
  /**
   * Generate simple IOR from file path
   */
  private async simpleIORGenerate(filePath: string): Promise<string> {
    const projectRoot = this.projectRootFind();
    const relativePath = path.relative(projectRoot, filePath);
    return `ior:git:github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/${relativePath}`;
  }
  
  /**
   * Create unit from complete file
   */
  private async fileUnitCreate(filename: string): Promise<void> {
    const originIOR = await this.simpleIORGenerate(filename);
    const fileName = path.basename(filename, path.extname(filename));
    
    const extension = path.extname(filename);
    if (extension === '.ts' || extension === '.js') {
      this.model.typeM3 = TypeM3.CLASS;
    } else {
      this.model.typeM3 = TypeM3.ATTRIBUTE;
    }
    
    this.model.name = fileName;
    this.model.origin = originIOR;
    this.model.definition = originIOR;
    this.model.updatedAt = new Date().toISOString();
    
    const scenario = await this.toScenario();
    await this.scenarioSave(this.model.uuid, scenario);
    
    console.log(`✅ Unit created from complete file: ${fileName}`);
    console.log(`   UUID: ${this.model.uuid}`);
    console.log(`   Origin IOR: ${originIOR}`);
  }
  
  /**
   * Create unit from folder (creates °folder.unit)
   */
  private async folderUnitCreate(folderPath: string): Promise<void> {
    const projectRoot = this.projectRootFind();
    const fullPath = path.isAbsolute(folderPath) ? folderPath : path.join(projectRoot, folderPath);
    
    this.model.uuid = this.uuidCreate();  // P29: IDProvider
    this.model.name = 'Folder';
    this.model.origin = await this.simpleIORGenerate(folderPath);
    this.model.definition = `M1 folder instance: ${folderPath}`;
    this.model.typeM3 = TypeM3.CLASS;
    this.model.createdAt = new Date().toISOString();
    this.model.updatedAt = new Date().toISOString();
    
    const scenario = await this.toScenario();
    await this.scenarioSave(this.model.uuid, scenario);
    
    // Create °folder.unit symlink
    const folderUnitPath = path.join(fullPath, '°folder.unit');
    const scenarioPath = await this.scenarioPathGet();
    const relativePath = path.relative(path.dirname(folderUnitPath), scenarioPath);
    
    try {
      await fs.unlink(folderUnitPath);
    } catch {
      // Ignore if doesn't exist
    }
    
    await fs.symlink(relativePath, folderUnitPath);
    
    console.log(`✅ Folder unit created: ${this.model.name}`);
    console.log(`   UUID: ${this.model.uuid}`);
    console.log(`   Folder Unit: ${path.relative(projectRoot, folderUnitPath)}`);
  }
  
  /**
   * Create unit from word-in-file (placeholder - full implementation in FUTURE)
   */
  private async wordInFileUnitCreate(filename: string, startPos: string, endPos: string): Promise<void> {
    // Simplified implementation - full GitTextIOR in FUTURE
    await this.fileUnitCreate(filename);
    console.log(`   Note: Word-in-file positions ${startPos}-${endPos} recorded`);
  }
  
  /**
   * Load scenario from storage
   */
  private async scenarioLoad(uuid: string): Promise<Scenario<UnitModel>> {
    const projectRoot = this.projectRootFind();
    const indexPath = this.indexPathBuild(uuid);
    const scenarioPath = path.join(projectRoot, 'scenarios', 'index', indexPath, `${uuid}.scenario.json`);
    
    // FsM.4: Load via IOR (P2P pattern)
    const loadIor = new IOR<string>().initRemote(`ior:file://${scenarioPath}`);
    const content = await loadIor.resolve();
    if (!content) {
      throw new Error(`[DefaultUnit] Scenario not found: ${uuid}`);
    }
    return JSON.parse(content);
  }
  
  /**
   * Save scenario to storage
   */
  private async scenarioSave(uuid: string, scenario: Scenario<UnitModel>): Promise<void> {
    const projectRoot = this.projectRootFind();
    const indexPath = this.indexPathBuild(uuid);
    const scenarioDir = path.join(projectRoot, 'scenarios', 'index', indexPath);
    const scenarioPath = path.join(scenarioDir, `${uuid}.scenario.json`);
    
    await fs.mkdir(scenarioDir, { recursive: true });
    
    // Update indexPath in model
    scenario.model.indexPath = scenarioPath;
    
    // FsM.4: Save via IOR (P2P pattern)
    const saveIor = new IOR<string>().initRemote(`ior:file://${scenarioPath}`);
    await saveIor.save(scenario);
  }
}
