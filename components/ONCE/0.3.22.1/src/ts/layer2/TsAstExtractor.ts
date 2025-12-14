/**
 * TsAstExtractor.ts - Extract type information from TypeScript AST
 * 
 * Web4 Principle P1: Everything is a Scenario
 * Extracts type metadata and stores as TypeDescriptor scenarios.
 * 
 * Web4 Principle P28: DRY + Code-First
 * AST is the single point of truth for type information.
 * 
 * Usage:
 * - Called during DefaultWeb4TSComponent.build()
 * - Extracts type info for all classes/interfaces in component
 * - Generates TypeDescriptor scenarios in scenarios/type/
 * 
 * @ior ior:esm:/ONCE/{version}/TsAstExtractor
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { TypeDescriptorModel } from '../layer3/TypeDescriptorModel.interface.js';
import type { AttributeDescriptor } from '../layer3/AttributeDescriptor.interface.js';
import type { PropertyDescriptor } from '../layer3/PropertyDescriptor.interface.js';
import type { ReferenceDescriptor } from '../layer3/ReferenceDescriptor.interface.js';
import type { CollectionDescriptor } from '../layer3/CollectionDescriptor.interface.js';
import type { MethodDescriptor } from '../layer3/MethodDescriptor.interface.js';
import type { ParameterDescriptor } from '../layer3/ParameterDescriptor.interface.js';
import type { Reference } from '../layer3/Reference.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';

/**
 * Extraction result for a single file
 */
interface ExtractionResult {
  filePath: string;
  types: TypeDescriptorModel[];
  errors: string[];
}

/**
 * TsAstExtractor - Extract TypeDescriptor scenarios from TypeScript AST
 */
export class TsAstExtractor {
  
  private componentRoot: string = '';
  private componentName: string = '';
  private componentVersion: string = '';
  private scenariosDir: string = '';
  
  /**
   * Empty constructor (Web4 P6)
   */
  constructor() {}
  
  /**
   * Initialize extractor
   */
  init(config: {
    componentRoot: string;
    componentName: string;
    componentVersion: string;
    scenariosDir: string;
  }): this {
    this.componentRoot = config.componentRoot;
    this.componentName = config.componentName;
    this.componentVersion = config.componentVersion;
    this.scenariosDir = config.scenariosDir;
    return this;
  }
  
  /**
   * Extract type descriptors from all TypeScript files in a directory
   */
  async extractDirectory(sourceDir: string): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];
    
    const tsFiles = this.findTsFiles(sourceDir);
    
    for (const filePath of tsFiles) {
      const result = await this.extractFile(filePath);
      if (result.types.length > 0 || result.errors.length > 0) {
        results.push(result);
      }
    }
    
    return results;
  }
  
  /**
   * Extract type descriptors from a single TypeScript file
   */
  async extractFile(filePath: string): Promise<ExtractionResult> {
    const result: ExtractionResult = {
      filePath,
      types: [],
      errors: [],
    };
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      const relativePath = path.relative(this.componentRoot, filePath);
      
      // Visit all nodes in the file
      const self = this;
      ts.forEachChild(sourceFile, function visit(node: ts.Node) {
        // Extract exported classes
        if (ts.isClassDeclaration(node) && self.isExported(node)) {
          const descriptor = self.extractClassDescriptor(node, sourceFile, relativePath);
          if (descriptor) {
            result.types.push(descriptor);
          }
        }
        
        // Extract exported interfaces
        if (ts.isInterfaceDeclaration(node) && self.isExported(node)) {
          const descriptor = self.extractInterfaceDescriptor(node, sourceFile, relativePath);
          if (descriptor) {
            result.types.push(descriptor);
          }
        }
        
        ts.forEachChild(node, visit);
      });
      
    } catch (error) {
      result.errors.push(`Error parsing ${filePath}: ${error}`);
    }
    
    return result;
  }
  
  /**
   * Check if a node is exported
   */
  private isExported(node: ts.Node): boolean {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    if (!modifiers) return false;
    return modifiers.some(function(mod: ts.Modifier) {
      return mod.kind === ts.SyntaxKind.ExportKeyword;
    });
  }
  
  /**
   * Check if a class is abstract
   */
  private isAbstract(node: ts.ClassDeclaration): boolean {
    const modifiers = ts.getModifiers(node);
    if (!modifiers) return false;
    return modifiers.some(function(mod: ts.Modifier) {
      return mod.kind === ts.SyntaxKind.AbstractKeyword;
    });
  }
  
  /**
   * Extract descriptor from a class declaration
   */
  private extractClassDescriptor(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    relativePath: string
  ): TypeDescriptorModel | null {
    if (!node.name) return null;
    
    const className = node.name.text;
    const uuid = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Extract extends clause
    let extendsIOR: Reference<string> = null;
    if (node.heritageClauses) {
      const extendsClause = node.heritageClauses.find(function(hc) {
        return hc.token === ts.SyntaxKind.ExtendsKeyword;
      });
      if (extendsClause && extendsClause.types.length > 0) {
        const parentName = extendsClause.types[0].expression.getText(sourceFile);
        extendsIOR = `ior:esm:/${this.componentName}/${this.componentVersion}/${parentName}`;
      }
    }
    
    // Extract implements clause
    const implementsIORs: string[] = [];
    if (node.heritageClauses) {
      const implementsClause = node.heritageClauses.find(function(hc) {
        return hc.token === ts.SyntaxKind.ImplementsKeyword;
      });
      if (implementsClause) {
        const self = this;
        implementsClause.types.forEach(function(type) {
          const interfaceName = type.expression.getText(sourceFile);
          implementsIORs.push(`ior:esm:/${self.componentName}/${self.componentVersion}/${interfaceName}`);
        });
      }
    }
    
    // Extract members
    const attributes: AttributeDescriptor[] = [];
    const properties: PropertyDescriptor[] = [];
    const references: ReferenceDescriptor[] = [];
    const collections: CollectionDescriptor[] = [];
    const methods: MethodDescriptor[] = [];
    
    const self = this;
    node.members.forEach(function(member) {
      // Properties (fields)
      if (ts.isPropertyDeclaration(member)) {
        const descriptor = self.extractPropertyOrAttribute(member, sourceFile);
        if (descriptor) {
          if (descriptor.kind === 'reference') {
            references.push(descriptor.value as ReferenceDescriptor);
          } else if (descriptor.kind === 'collection') {
            collections.push(descriptor.value as CollectionDescriptor);
          } else {
            attributes.push(descriptor.value as AttributeDescriptor);
          }
        }
      }
      
      // Getters/Setters
      if (ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
        const propDesc = self.extractAccessor(member, sourceFile, node.members);
        if (propDesc) {
          // Only add if not already added (avoid duplicates from getter+setter pairs)
          const exists = properties.some(function(p) { return p.name === propDesc.name; });
          if (!exists) {
            properties.push(propDesc);
          }
        }
      }
      
      // Methods
      if (ts.isMethodDeclaration(member)) {
        const methodDesc = self.extractMethod(member, sourceFile);
        if (methodDesc) {
          methods.push(methodDesc);
        }
      }
    });
    
    return {
      uuid,
      name: className,
      extends: extendsIOR,
      implements: implementsIORs,
      sourcePath: relativePath,
      indexPath: `scenarios/index/${uuid}.type.scenario.json`,
      symlinkPaths: [
        `scenarios/type/${className}.type.scenario.json`,
      ],
      attributes,
      properties,
      references,
      collections,
      methods,
      component: this.componentName,
      version: this.componentVersion,
      createdAt: now,
      updatedAt: now,
      isInterface: false,
      isAbstract: this.isAbstract(node),
    };
  }
  
  /**
   * Extract descriptor from an interface declaration
   */
  private extractInterfaceDescriptor(
    node: ts.InterfaceDeclaration,
    sourceFile: ts.SourceFile,
    relativePath: string
  ): TypeDescriptorModel | null {
    if (!node.name) return null;
    
    const interfaceName = node.name.text;
    const uuid = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Extract extends clause (interfaces can extend other interfaces)
    const extendsIORs: string[] = [];
    if (node.heritageClauses) {
      const extendsClause = node.heritageClauses.find(function(hc) {
        return hc.token === ts.SyntaxKind.ExtendsKeyword;
      });
      if (extendsClause) {
        const self = this;
        extendsClause.types.forEach(function(type) {
          const parentName = type.expression.getText(sourceFile);
          extendsIORs.push(`ior:esm:/${self.componentName}/${self.componentVersion}/${parentName}`);
        });
      }
    }
    
    // Extract members
    const attributes: AttributeDescriptor[] = [];
    const properties: PropertyDescriptor[] = [];
    const references: ReferenceDescriptor[] = [];
    const collections: CollectionDescriptor[] = [];
    const methods: MethodDescriptor[] = [];
    
    const self = this;
    node.members.forEach(function(member) {
      // Property signatures
      if (ts.isPropertySignature(member)) {
        const descriptor = self.extractPropertySignature(member, sourceFile);
        if (descriptor) {
          if (descriptor.kind === 'reference') {
            references.push(descriptor.value as ReferenceDescriptor);
          } else if (descriptor.kind === 'collection') {
            collections.push(descriptor.value as CollectionDescriptor);
          } else {
            attributes.push(descriptor.value as AttributeDescriptor);
          }
        }
      }
      
      // Method signatures
      if (ts.isMethodSignature(member)) {
        const methodDesc = self.extractMethodSignature(member, sourceFile);
        if (methodDesc) {
          methods.push(methodDesc);
        }
      }
    });
    
    return {
      uuid,
      name: interfaceName,
      extends: extendsIORs.length > 0 ? extendsIORs[0] : null,
      implements: extendsIORs.slice(1), // Additional extends go to implements
      sourcePath: relativePath,
      indexPath: `scenarios/index/${uuid}.type.scenario.json`,
      symlinkPaths: [
        `scenarios/type/${interfaceName}.type.scenario.json`,
      ],
      attributes,
      properties,
      references,
      collections,
      methods,
      component: this.componentName,
      version: this.componentVersion,
      createdAt: now,
      updatedAt: now,
      isInterface: true,
      isAbstract: false,
    };
  }
  
  /**
   * Extract property or attribute from property declaration
   */
  private extractPropertyOrAttribute(
    node: ts.PropertyDeclaration,
    sourceFile: ts.SourceFile
  ): { kind: 'attribute' | 'reference' | 'collection'; value: AttributeDescriptor | ReferenceDescriptor | CollectionDescriptor } | null {
    if (!node.name) return null;
    
    const name = node.name.getText(sourceFile);
    const typeText = node.type ? node.type.getText(sourceFile) : 'any';
    const optional = !!node.questionToken;
    
    // Check for Reference<T>
    if (typeText.startsWith('Reference<')) {
      const targetType = typeText.replace(/Reference<(.+)>/, '$1');
      return {
        kind: 'reference',
        value: { name, targetType },
      };
    }
    
    // Check for Collection<T> or Array
    if (typeText.startsWith('Collection<') || typeText.endsWith('[]')) {
      const elementType = typeText.startsWith('Collection<')
        ? typeText.replace(/Collection<(.+)>/, '$1')
        : typeText.replace(/\[\]$/, '');
      return {
        kind: 'collection',
        value: { name, elementType },
      };
    }
    
    // Regular attribute
    let defaultValue: Reference<unknown> = null;
    if (node.initializer) {
      try {
        const initText = node.initializer.getText(sourceFile);
        // Simple literal parsing
        if (initText === 'null' || initText === 'undefined') {
          defaultValue = null;
        } else if (initText === 'true' || initText === 'false') {
          defaultValue = initText === 'true';
        } else if (/^['"]/.test(initText)) {
          defaultValue = initText.slice(1, -1);
        } else if (/^\d/.test(initText)) {
          defaultValue = parseFloat(initText);
        }
      } catch {
        // Ignore complex initializers
      }
    }
    
    return {
      kind: 'attribute',
      value: { name, type: typeText, optional, defaultValue },
    };
  }
  
  /**
   * Extract property signature from interface
   */
  private extractPropertySignature(
    node: ts.PropertySignature,
    sourceFile: ts.SourceFile
  ): { kind: 'attribute' | 'reference' | 'collection'; value: AttributeDescriptor | ReferenceDescriptor | CollectionDescriptor } | null {
    if (!node.name) return null;
    
    const name = node.name.getText(sourceFile);
    const typeText = node.type ? node.type.getText(sourceFile) : 'any';
    const optional = !!node.questionToken;
    
    // Check for Reference<T>
    if (typeText.startsWith('Reference<')) {
      const targetType = typeText.replace(/Reference<(.+)>/, '$1');
      return {
        kind: 'reference',
        value: { name, targetType },
      };
    }
    
    // Check for Collection<T> or Array
    if (typeText.startsWith('Collection<') || typeText.endsWith('[]')) {
      const elementType = typeText.startsWith('Collection<')
        ? typeText.replace(/Collection<(.+)>/, '$1')
        : typeText.replace(/\[\]$/, '');
      return {
        kind: 'collection',
        value: { name, elementType },
      };
    }
    
    return {
      kind: 'attribute',
      value: { name, type: typeText, optional, defaultValue: null },
    };
  }
  
  /**
   * Extract accessor (getter/setter)
   */
  private extractAccessor(
    node: ts.GetAccessorDeclaration | ts.SetAccessorDeclaration,
    sourceFile: ts.SourceFile,
    allMembers: ts.NodeArray<ts.ClassElement>
  ): PropertyDescriptor | null {
    if (!node.name) return null;
    
    const name = node.name.getText(sourceFile);
    const isGetter = ts.isGetAccessor(node);
    
    // Find matching getter/setter
    let hasGetter = isGetter;
    let hasSetter = !isGetter;
    
    allMembers.forEach(function(member) {
      if (ts.isGetAccessor(member) && member.name?.getText(sourceFile) === name) {
        hasGetter = true;
      }
      if (ts.isSetAccessor(member) && member.name?.getText(sourceFile) === name) {
        hasSetter = true;
      }
    });
    
    const type = isGetter && node.type 
      ? node.type.getText(sourceFile) 
      : 'unknown';
    
    return {
      name,
      type,
      hasGetter,
      hasSetter,
      isReadonly: hasGetter && !hasSetter,
    };
  }
  
  /**
   * Extract method from method declaration
   */
  private extractMethod(
    node: ts.MethodDeclaration,
    sourceFile: ts.SourceFile
  ): MethodDescriptor | null {
    if (!node.name) return null;
    
    const name = node.name.getText(sourceFile);
    const returnType = node.type ? node.type.getText(sourceFile) : 'void';
    const modifiers = ts.getModifiers(node);
    const isAsync = modifiers?.some(function(mod: ts.Modifier) {
      return mod.kind === ts.SyntaxKind.AsyncKeyword;
    }) ?? false;
    
    // Extract parameters
    const parameters: ParameterDescriptor[] = [];
    node.parameters.forEach(function(param) {
      const paramName = param.name.getText(sourceFile);
      const paramType = param.type ? param.type.getText(sourceFile) : 'any';
      const optional = !!param.questionToken;
      let defaultValue: Reference<unknown> = null;
      
      if (param.initializer) {
        try {
          defaultValue = param.initializer.getText(sourceFile);
        } catch {
          // Ignore
        }
      }
      
      parameters.push({ name: paramName, type: paramType, optional, defaultValue });
    });
    
    // Check for @action TSDoc
    const jsDocTags = ts.getJSDocTags(node);
    const isAction = jsDocTags.some(function(tag) {
      return tag.tagName.text === 'action';
    });
    
    return {
      name,
      parameters,
      returnType,
      isAsync,
      isAction,
      actionMetadata: null, // TODO: Extract action metadata from TSDoc
    };
  }
  
  /**
   * Extract method from method signature (interface)
   */
  private extractMethodSignature(
    node: ts.MethodSignature,
    sourceFile: ts.SourceFile
  ): MethodDescriptor | null {
    if (!node.name) return null;
    
    const name = node.name.getText(sourceFile);
    const returnType = node.type ? node.type.getText(sourceFile) : 'void';
    
    // Extract parameters
    const parameters: ParameterDescriptor[] = [];
    node.parameters.forEach(function(param) {
      const paramName = param.name.getText(sourceFile);
      const paramType = param.type ? param.type.getText(sourceFile) : 'any';
      const optional = !!param.questionToken;
      
      parameters.push({ name: paramName, type: paramType, optional, defaultValue: null });
    });
    
    return {
      name,
      parameters,
      returnType,
      isAsync: returnType.startsWith('Promise<'),
      isAction: false,
      actionMetadata: null,
    };
  }
  
  /**
   * Find all TypeScript files in a directory
   */
  private findTsFiles(dir: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const self = this;
    
    entries.forEach(function(entry) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
          files.push(...self.findTsFiles(fullPath));
        }
      } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }
  
  /**
   * Save extracted type descriptors as scenarios
   */
  async saveScenarios(results: ExtractionResult[]): Promise<void> {
    const indexDir = path.join(this.scenariosDir, 'index');
    const typeDir = path.join(this.scenariosDir, 'type');
    
    // Ensure directories exist
    if (!fs.existsSync(indexDir)) {
      fs.mkdirSync(indexDir, { recursive: true });
    }
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    for (const result of results) {
      for (const typeModel of result.types) {
        const scenario: Scenario<TypeDescriptorModel> = {
          ior: {
            uuid: typeModel.uuid,
            component: this.componentName,
            version: this.componentVersion,
          },
          owner: 'TsAstExtractor',
          model: typeModel,
        };
        
        // Save to index
        const indexPath = path.join(this.scenariosDir, typeModel.indexPath.replace('scenarios/', ''));
        fs.writeFileSync(indexPath, JSON.stringify(scenario, null, 2));
        
        // Create symlink in type directory
        for (const symlinkPath of typeModel.symlinkPaths) {
          const linkPath = path.join(this.scenariosDir, symlinkPath.replace('scenarios/', ''));
          const relativeLinkTarget = path.relative(path.dirname(linkPath), indexPath);
          
          // Remove existing symlink
          if (fs.existsSync(linkPath)) {
            fs.unlinkSync(linkPath);
          }
          
          fs.symlinkSync(relativeLinkTarget, linkPath);
        }
      }
    }
  }
}

