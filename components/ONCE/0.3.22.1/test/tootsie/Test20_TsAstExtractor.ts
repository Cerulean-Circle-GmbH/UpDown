/**
 * Test20_TsAstExtractor - Test TypeScript AST extraction for type scenarios
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 28: DRY + Code-First (AST is single point of truth)
 * ✅ Web4 Radical OOP: No inline functions, model-based state
 * 
 * Tests:
 * 1. Extract TypeDescriptor from a class file
 * 2. Extract TypeDescriptor from an interface file
 * 3. Detect extends and implements clauses
 * 4. Extract attributes, properties, methods
 * 5. Save as scenarios with proper symlinks
 * 
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import * as fs from 'fs';
import * as path from 'path';
import { TsAstExtractor } from '../../src/ts/layer2/TsAstExtractor.js';
import type { TypeDescriptorModel } from '../../src/ts/layer3/TypeDescriptorModel.interface.js';

/**
 * Test model - Radical OOP state management
 */
interface Test20Model {
  extractor: TsAstExtractor | null;
  testScenariosDir: string;
  extractedTypes: string[];
  /** Current search target for type lookup */
  searchTypeName: string;
}

/**
 * Test20_TsAstExtractor - Verify AST extraction creates type scenarios
 * 
 * Uses Radical OOP patterns:
 * - Model-based state instead of inline closures
 * - Class methods instead of anonymous functions
 */
export class Test20_TsAstExtractor extends ONCETestCase {
  
  testModel: Test20Model = {
    extractor: null,
    testScenariosDir: '',
    extractedTypes: [],
    searchTypeName: '',
  };
  
  // ═══════════════════════════════════════════════════════════════
  // RADICAL OOP HELPER METHODS (replace inline functions)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Check if type matches current search name
   * Used as predicate for array methods - bound to model state
   */
  private typeNameMatches(type: TypeDescriptorModel): boolean {
    return type.name === this.testModel.searchTypeName;
  }
  
  /**
   * Find type by name in array
   * @param types Array of types to search
   * @param name Name to find
   */
  private typeFindByName(types: TypeDescriptorModel[], name: string): TypeDescriptorModel | undefined {
    this.testModel.searchTypeName = name;
    for (const type of types) {
      if (this.typeNameMatches(type)) {
        return type;
      }
    }
    return undefined;
  }
  
  /**
   * Check if type exists by name
   * @param types Array of types to search
   * @param name Name to check
   */
  private typeExistsByName(types: TypeDescriptorModel[], name: string): boolean {
    return this.typeFindByName(types, name) !== undefined;
  }
  
  /**
   * Extract all type names from array
   * @param types Array of types
   */
  private typeNamesExtract(types: TypeDescriptorModel[]): string[] {
    const names: string[] = [];
    for (const type of types) {
      names.push(type.name);
    }
    return names;
  }
  
  /**
   * Extract all method names from type
   * @param type Type to extract from
   */
  private methodNamesExtract(type: TypeDescriptorModel): string[] {
    const names: string[] = [];
    for (const method of type.methods) {
      names.push(method.name);
    }
    return names;
  }
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    // Use test data directory for scenarios
    this.testModel.testScenariosDir = path.join(this.componentRoot, 'test', 'data', 'scenarios-ast');
    
    // Clean up previous test data
    if (fs.existsSync(this.testModel.testScenariosDir)) {
      fs.rmSync(this.testModel.testScenariosDir, { recursive: true });
    }
    fs.mkdirSync(this.testModel.testScenariosDir, { recursive: true });
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: Initialize TsAstExtractor
    // ═══════════════════════════════════════════════════════════════
    const initReq = this.requirement('TsAstExtractor Initialization', 'Verify extractor can be initialized');
    initReq.addCriterion('INIT-01', 'Extractor initializes without error');
    
    this.testModel.extractor = new TsAstExtractor().init({
      componentRoot: this.componentRoot,
      componentName: 'ONCE',
      componentVersion: '0.3.21.8',
      scenariosDir: this.testModel.testScenariosDir,
    });
    
    initReq.validateCriterion('INIT-01', this.testModel.extractor !== null, {
      actual: this.testModel.extractor !== null,
    });
    this.validateRequirement(initReq);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: Extract from JsInterface.ts (abstract class)
    // ═══════════════════════════════════════════════════════════════
    const jsInterfaceReq = this.requirement('JsInterface Extraction', 'Extract TypeDescriptor from JsInterface.ts');
    jsInterfaceReq.addCriterion('JS-01', 'No errors during extraction');
    jsInterfaceReq.addCriterion('JS-02', 'JsInterface type found');
    
    const jsInterfacePath = path.join(this.componentRoot, 'src', 'ts', 'layer3', 'JsInterface.ts');
    const jsInterfaceResult = await this.testModel.extractor.extractFile(jsInterfacePath);
    
    jsInterfaceReq.validateCriterion('JS-01', jsInterfaceResult.errors.length === 0, {
      actual: jsInterfaceResult.errors,
    });
    
    const jsInterfaceFound = this.typeExistsByName(jsInterfaceResult.types, 'JsInterface');
    jsInterfaceReq.validateCriterion('JS-02', jsInterfaceFound, {
      actual: this.typeNamesExtract(jsInterfaceResult.types),
    });
    
    const jsInterfaceType = this.typeFindByName(jsInterfaceResult.types, 'JsInterface');
    if (jsInterfaceType) {
      this.logEvidence('evidence', `JsInterface.isAbstract: ${jsInterfaceType.isAbstract}`);
      this.logEvidence('evidence', `JsInterface.methods: ${this.methodNamesExtract(jsInterfaceType).join(', ')}`);
      this.testModel.extractedTypes.push('JsInterface');
    }
    this.validateRequirement(jsInterfaceReq);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: Extract from PersistenceManager.interface.ts
    // ═══════════════════════════════════════════════════════════════
    const pmReq = this.requirement('PersistenceManager Extraction', 'Extract TypeDescriptor from interface');
    pmReq.addCriterion('PM-01', 'No errors during extraction');
    pmReq.addCriterion('PM-02', 'PersistenceManager type found');
    
    const pmPath = path.join(this.componentRoot, 'src', 'ts', 'layer3', 'PersistenceManager.interface.ts');
    const pmResult = await this.testModel.extractor.extractFile(pmPath);
    
    pmReq.validateCriterion('PM-01', pmResult.errors.length === 0, {
      actual: pmResult.errors,
    });
    
    const pmFound = this.typeExistsByName(pmResult.types, 'PersistenceManager');
    pmReq.validateCriterion('PM-02', pmFound, {
      actual: this.typeNamesExtract(pmResult.types),
    });
    
    const pmType = this.typeFindByName(pmResult.types, 'PersistenceManager');
    if (pmType) {
      this.logEvidence('evidence', `PersistenceManager.isInterface: ${pmType.isInterface}`);
      this.logEvidence('evidence', `PersistenceManager.methods: ${this.methodNamesExtract(pmType).join(', ')}`);
      this.testModel.extractedTypes.push('PersistenceManager');
    }
    this.validateRequirement(pmReq);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 4: Extract from UcpStorage.ts (extends, implements)
    // ═══════════════════════════════════════════════════════════════
    const ucpReq = this.requirement('UcpStorage Extraction', 'Extract class with extends/implements');
    ucpReq.addCriterion('UCP-01', 'No errors during extraction');
    ucpReq.addCriterion('UCP-02', 'UcpStorage type found');
    ucpReq.addCriterion('UCP-03', 'UcpStorage implements an interface');
    
    const ucpStoragePath = path.join(this.componentRoot, 'src', 'ts', 'layer2', 'UcpStorage.ts');
    const ucpStorageResult = await this.testModel.extractor.extractFile(ucpStoragePath);
    
    ucpReq.validateCriterion('UCP-01', ucpStorageResult.errors.length === 0, {
      actual: ucpStorageResult.errors,
    });
    
    const ucpFound = this.typeExistsByName(ucpStorageResult.types, 'UcpStorage');
    ucpReq.validateCriterion('UCP-02', ucpFound, {
      actual: this.typeNamesExtract(ucpStorageResult.types),
    });
    
    const ucpStorageType = this.typeFindByName(ucpStorageResult.types, 'UcpStorage');
    if (ucpStorageType) {
      this.logEvidence('evidence', `UcpStorage.extends: ${ucpStorageType.extends}`);
      this.logEvidence('evidence', `UcpStorage.implements: ${ucpStorageType.implements.join(', ')}`);
      this.testModel.extractedTypes.push('UcpStorage');
      
      // UcpStorage implements Storage (which extends PersistenceManager)
      const hasImplements = ucpStorageType.implements.length > 0;
      ucpReq.validateCriterion('UCP-03', hasImplements, {
        actual: ucpStorageType.implements,
      });
    }
    this.validateRequirement(ucpReq);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 5: Save as scenarios with symlinks
    // ═══════════════════════════════════════════════════════════════
    const saveReq = this.requirement('Scenario Persistence', 'Save extracted types as scenarios');
    saveReq.addCriterion('SAVE-01', 'Index directory created');
    saveReq.addCriterion('SAVE-02', 'Type directory created');
    saveReq.addCriterion('SAVE-03', 'Type symlinks created');
    saveReq.addCriterion('SAVE-04', 'JsInterface scenario is valid symlink');
    saveReq.addCriterion('SAVE-05', 'Scenario has correct structure');
    
    // Combine all results
    const allResults = [jsInterfaceResult, pmResult, ucpStorageResult];
    await this.testModel.extractor.saveScenarios(allResults);
    
    // Verify index files exist
    const indexDir = path.join(this.testModel.testScenariosDir, 'index');
    const typeDir = path.join(this.testModel.testScenariosDir, 'type');
    
    saveReq.validateCriterion('SAVE-01', fs.existsSync(indexDir), {
      actual: fs.existsSync(indexDir),
    });
    
    saveReq.validateCriterion('SAVE-02', fs.existsSync(typeDir), {
      actual: fs.existsSync(typeDir),
    });
    
    // Check symlinks
    const typeSymlinks = fs.existsSync(typeDir) ? fs.readdirSync(typeDir) : [];
    this.logEvidence('evidence', `Type symlinks: ${typeSymlinks.join(', ')}`);
    
    saveReq.validateCriterion('SAVE-03', typeSymlinks.length > 0, {
      actual: typeSymlinks.length,
    });
    
    // Verify JsInterface scenario
    const jsInterfaceScenarioLink = path.join(typeDir, 'JsInterface.type.scenario.json');
    const isSymlink = fs.existsSync(jsInterfaceScenarioLink) && 
                      fs.lstatSync(jsInterfaceScenarioLink).isSymbolicLink();
    saveReq.validateCriterion('SAVE-04', isSymlink, {
      actual: isSymlink,
    });
    
    // Read and validate content
    if (fs.existsSync(jsInterfaceScenarioLink)) {
      const scenarioContent = JSON.parse(fs.readFileSync(jsInterfaceScenarioLink, 'utf-8'));
      const hasCorrectStructure = scenarioContent.ior !== undefined && 
                                   scenarioContent.model?.name === 'JsInterface';
      saveReq.validateCriterion('SAVE-05', hasCorrectStructure, {
        actual: { hasIor: !!scenarioContent.ior, name: scenarioContent.model?.name },
      });
      this.logEvidence('evidence', `Scenario UUID: ${scenarioContent.ior?.uuid}`);
    } else {
      saveReq.validateCriterion('SAVE-05', false, { actual: 'File not found' });
    }
    
    this.validateRequirement(saveReq);
    
    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('step', 'EXTRACTION SUMMARY');
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('evidence', `Types extracted: ${this.testModel.extractedTypes.join(', ')}`);
    this.logEvidence('evidence', `Scenarios saved to: ${this.testModel.testScenariosDir}`);
  }
}
