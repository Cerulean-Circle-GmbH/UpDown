/**
 * PumlUnitConverter - Parse PlantUML class diagrams into M3 CLASS units
 *
 * Web4 Principles:
 * - P4: Radical OOP
 * - P6: Empty constructor + init()
 * - P16: Object-Action naming
 * - P19: One File One Type
 */

import { ScenarioService } from './ScenarioService.js';
import { TypeM3 } from '@web4x/ucp/TypeM3';
import type { Scenario } from '@web4x/ucp/Scenario';
import type { Model } from '@web4x/ucp/Model';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Parsed class from a PUML diagram
 */
export interface PumlClass {
  name: string;
  stereotype?: string;
  extends?: string;
  implements?: string[];
  methods: string[];
  properties: string[];
  packageName?: string;
}

/**
 * Result of a PUML conversion
 */
export interface ConversionResult {
  pumlFile: string;
  classesFound: number;
  m3UnitsCreated: number;
  tsUnitsLinked: number;
  errors: string[];
}

/**
 * PumlUnitConverter — Parses PUML class diagrams into M3 CLASS units
 */
export class PumlUnitConverter {
  private scenarioService: ScenarioService | null = null;
  private projectRoot: string = '';
  private componentName: string = '';
  private componentVersion: string = '';

  constructor() {}

  init(config: {
    scenarioService: ScenarioService;
    projectRoot: string;
    componentName: string;
    componentVersion: string;
  }): this {
    this.scenarioService = config.scenarioService;
    this.projectRoot = config.projectRoot;
    this.componentName = config.componentName;
    this.componentVersion = config.componentVersion;
    return this;
  }

  // ═══════════════════════════════════════════════════════════════
  // PUML Parsing
  // ═══════════════════════════════════════════════════════════════

  async pumlParse(pumlFilePath: string): Promise<PumlClass[]> {
    const content = await fs.promises.readFile(pumlFilePath, 'utf-8');
    const lines = content.split('\n');
    const classes: PumlClass[] = [];
    let currentClass: PumlClass | null = null;
    let currentPackage: string | undefined;
    let braceDepth = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Package detection
      const packageMatch = line.match(/^package\s+"([^"]+)"/);
      if (packageMatch) {
        currentPackage = packageMatch[1];
        continue;
      }

      // Class declaration: class "Name" or class Name
      const classMatch = line.match(/^(?:abstract\s+)?class\s+"?([^"{\s]+)"?\s*(?:<<([^>]+)>>)?\s*\{?\s*$/);
      if (classMatch) {
        currentClass = {
          name: classMatch[1],
          stereotype: classMatch[2],
          methods: [],
          properties: [],
          implements: [],
          packageName: currentPackage,
        };
        braceDepth = line.includes('{') ? 1 : 0;
        classes.push(currentClass);
        continue;
      }

      // Opening brace for class body
      if (currentClass && line === '{') {
        braceDepth++;
        continue;
      }

      // Closing brace
      if (currentClass && line === '}') {
        braceDepth--;
        if (braceDepth <= 0) {
          currentClass = null;
          braceDepth = 0;
        }
        continue;
      }

      // Class body: methods and properties
      if (currentClass && braceDepth > 0) {
        const memberMatch = line.match(/^([+\-#~])\s*(.+)$/);
        if (memberMatch) {
          const member = memberMatch[2];
          if (member.includes('(')) {
            currentClass.methods.push(member);
          } else {
            currentClass.properties.push(member);
          }
        }
        continue;
      }

      // Extends relationship: ClassName --|> Parent
      const extendsMatch = line.match(/^"?([^"]+)"?\s+--\|>\s+"?([^":\s]+)"?/);
      if (extendsMatch) {
        const child = classes.find(c => c.name === extendsMatch[1]);
        if (child) {
          child.extends = extendsMatch[2];
        }
        continue;
      }

      // Implements relationship: ClassName ..|> Interface
      const implementsMatch = line.match(/^"?([^"]+)"?\s+\.\.\|>\s+"?([^":\s]+)"?/);
      if (implementsMatch) {
        const child = classes.find(c => c.name === implementsMatch[1]);
        if (child) {
          child.implements = child.implements || [];
          child.implements.push(implementsMatch[2]);
        }
        continue;
      }
    }

    return classes;
  }

  // ═══════════════════════════════════════════════════════════════
  // M3 Unit Creation
  // ═══════════════════════════════════════════════════════════════

  async m3UnitsCreate(classes: PumlClass[]): Promise<Scenario<Model>[]> {
    const m3Dir = path.join(this.projectRoot, 'MDAv4', 'M3', 'CLASS');
    await fs.promises.mkdir(m3Dir, { recursive: true });

    const scenarios: Scenario<Model>[] = [];

    for (const pumlClass of classes) {
      const uuid = crypto.randomUUID();
      const now = new Date().toISOString();
      const unitPath = path.join(m3Dir, `${pumlClass.name}.unit`);

      const scenario: Scenario<Model> = {
        ior: {
          uuid,
          component: this.componentName,
          version: this.componentVersion,
        },
        owner: 'system',
        model: {
          uuid,
          name: pumlClass.name,
          typeM3: TypeM3.CLASS,
          origin: `ior:git:text:github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/${this.componentName}/${this.componentVersion}/src/ts/layer2/${pumlClass.name}.ts`,
          definition: pumlClass.stereotype || `TypeScript ${pumlClass.name} class`,
          indexPath: unitPath,
          references: [],
          createdAt: now,
          updatedAt: now,
        } as any,
      };

      await fs.promises.writeFile(
        unitPath,
        JSON.stringify(scenario, null, 2) + '\n'
      );

      scenarios.push(scenario);
    }

    return scenarios;
  }

  // ═══════════════════════════════════════════════════════════════
  // .ts.unit Linking
  // ═══════════════════════════════════════════════════════════════

  async tsUnitsLink(
    m3Units: Scenario<Model>[],
    componentRoot: string
  ): Promise<number> {
    let linked = 0;

    for (const m3Unit of m3Units) {
      const m3Model = m3Unit.model as any;
      const className = m3Model.name;

      // Search for matching .ts file in layer2
      const tsFilePath = path.join(componentRoot, 'src', 'ts', 'layer2', `${className}.ts`);

      if (fs.existsSync(tsFilePath)) {
        const unitFilePath = `${tsFilePath}.unit`;

        const tsUnitScenario = {
          ior: m3Unit.ior,
          owner: 'system',
          model: {
            uuid: m3Model.uuid,
            name: path.basename(tsFilePath),
            typeM3: TypeM3.CLASS,
            origin: `ior:file://${tsFilePath}`,
            definition: m3Model.definition,
            filePath: path.relative(componentRoot, tsFilePath),
            references: [
              {
                linkLocation: `ior:file://${unitFilePath}`,
                linkTarget: `ior:file://${m3Model.indexPath}`,
                syncStatus: 'SYNCED',
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };

        await fs.promises.writeFile(
          unitFilePath,
          JSON.stringify(tsUnitScenario, null, 2) + '\n'
        );

        // Add back-link from M3 unit
        m3Model.references.push({
          linkLocation: `ior:file://${m3Model.indexPath}`,
          linkTarget: `ior:file://${unitFilePath}`,
          syncStatus: 'SYNCED',
        });

        // Update M3 unit file with back-link
        await fs.promises.writeFile(
          m3Model.indexPath,
          JSON.stringify(m3Unit, null, 2) + '\n'
        );

        linked++;
      }
    }

    return linked;
  }

  // ═══════════════════════════════════════════════════════════════
  // Full Pipeline
  // ═══════════════════════════════════════════════════════════════

  async convertPuml(
    pumlFilePath: string,
    componentRoot: string
  ): Promise<ConversionResult> {
    const errors: string[] = [];
    let classesFound = 0;
    let m3UnitsCreated = 0;
    let tsUnitsLinked = 0;

    try {
      const classes = await this.pumlParse(pumlFilePath);
      classesFound = classes.length;

      const m3Units = await this.m3UnitsCreate(classes);
      m3UnitsCreated = m3Units.length;

      tsUnitsLinked = await this.tsUnitsLink(m3Units, componentRoot);
    } catch (error: any) {
      errors.push(error.message);
    }

    return {
      pumlFile: pumlFilePath,
      classesFound,
      m3UnitsCreated,
      tsUnitsLinked,
      errors,
    };
  }
}
