/**
 * PumlUnitConverter - Parses PlantUML class diagrams into M3 CLASS units
 *
 * Web4 Principles:
 * - P6: Empty constructor + init()
 * - P16: Object-Action naming (pumlParse, m3UnitsCreate, tsUnitsLink)
 * - P19: One File One Type
 */

import { ScenarioService } from './ScenarioService.js';
import { UnitDiscoveryService } from './UnitDiscoveryService.js';
import { TypeM3 } from '../layer3/TypeM3.enum.js';
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { UnitModel } from '../layer3/UnitModel.interface.js';
import type { UnitReference } from '../layer3/UnitReference.interface.js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface PumlClass {
  name: string;
  stereotype?: string;
  extends?: string;
  implements?: string[];
  methods: string[];
  properties: string[];
  packageName?: string;
}

export interface ConversionResult {
  pumlFile: string;
  classesFound: number;
  m3UnitsCreated: number;
  tsUnitsLinked: number;
  errors: string[];
}

export class PumlUnitConverter {
  private scenarioService!: ScenarioService;
  private unitDiscoveryService!: UnitDiscoveryService;
  private projectRoot!: string;
  private componentName!: string;
  private componentVersion!: string;

  constructor() {}

  init(config: {
    scenarioService: ScenarioService;
    projectRoot: string;
    componentName: string;
    componentVersion: string;
  }): this {
    this.scenarioService = config.scenarioService;
    this.unitDiscoveryService = new UnitDiscoveryService();
    this.projectRoot = config.projectRoot;
    this.componentName = config.componentName;
    this.componentVersion = config.componentVersion;
    return this;
  }

  async pumlParse(pumlFilePath: string): Promise<PumlClass[]> {
    const content = await fs.promises.readFile(pumlFilePath, 'utf-8');
    const classes: PumlClass[] = [];
    const lines = content.split('\n');

    let currentClass: PumlClass | null = null;
    let currentPackage: string | undefined;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      const packageMatch = line.match(/^package\s+"([^"]+)"/);
      if (packageMatch) {
        currentPackage = packageMatch[1];
        continue;
      }

      const classMatch = line.match(/^(?:abstract\s+)?class\s+"?([^"{<\s]+)"?\s*(?:<<([^>]+)>>)?/);
      if (classMatch) {
        currentClass = {
          name: classMatch[1],
          stereotype: classMatch[2],
          methods: [],
          properties: [],
          packageName: currentPackage
        };
        classes.push(currentClass);
        continue;
      }

      if (currentClass && line === '}') {
        currentClass = null;
        continue;
      }

      if (currentClass && line.startsWith('+')) {
        const member = line.substring(1).trim();
        if (member.includes('(')) {
          currentClass.methods.push(member);
        } else {
          currentClass.properties.push(member);
        }
        continue;
      }

      const extendsMatch = line.match(/^"?(\w+)"?\s+(?:--|>|extends)\s+"?(\w+)"?/);
      if (extendsMatch) {
        const child = classes.find(c => c.name === extendsMatch[1]);
        if (child) {
          child.extends = extendsMatch[2];
        }
        continue;
      }

      const implementsMatch = line.match(/^"?(\w+)"?\s+(?:\.\.|>|implements)\s+"?(\w+)"?/);
      if (implementsMatch) {
        const child = classes.find(c => c.name === implementsMatch[1]);
        if (child) {
          if (!child.implements) child.implements = [];
          child.implements.push(implementsMatch[2]);
        }
        continue;
      }
    }

    return classes;
  }

  async m3UnitsCreate(classes: PumlClass[]): Promise<Scenario<UnitModel>[]> {
    const m3Dir = path.join(this.projectRoot, 'MDAv4', 'M3', 'CLASS');
    await fs.promises.mkdir(m3Dir, { recursive: true });

    const units: Scenario<UnitModel>[] = [];

    for (const cls of classes) {
      const uuid = crypto.randomUUID();
      const unitPath = path.join(m3Dir, `${cls.name}.unit`);

      const scenario: Scenario<UnitModel> = {
        ior: {
          uuid,
          component: this.componentName,
          version: this.componentVersion
        },
        owner: `${this.componentName}-v${this.componentVersion}`,
        model: {
          uuid,
          name: cls.name,
          origin: `ior:puml://${cls.name}`,
          definition: `ior:class://${cls.name}`,
          typeM3: TypeM3.CLASS,
          indexPath: unitPath,
          references: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await fs.promises.writeFile(
        unitPath,
        JSON.stringify(scenario, null, 2) + '\n'
      );

      units.push(scenario);
    }

    return units;
  }

  async tsUnitsLink(
    m3Units: Scenario<UnitModel>[],
    componentRoot: string
  ): Promise<number> {
    let linked = 0;

    for (const m3Unit of m3Units) {
      const className = m3Unit.model.name;
      const tsFiles = await this.tsFileFind(componentRoot, className);

      for (const tsFile of tsFiles) {
        await this.unitDiscoveryService.tsUnitCreate(tsFile, m3Unit);

        const m3UnitPath = m3Unit.model.indexPath;
        await fs.promises.writeFile(
          m3UnitPath,
          JSON.stringify(m3Unit, null, 2) + '\n'
        );

        linked++;
      }
    }

    return linked;
  }

  async convertPuml(
    pumlFilePath: string,
    componentRoot: string
  ): Promise<ConversionResult> {
    const result: ConversionResult = {
      pumlFile: pumlFilePath,
      classesFound: 0,
      m3UnitsCreated: 0,
      tsUnitsLinked: 0,
      errors: []
    };

    const classes = await this.pumlParse(pumlFilePath);
    result.classesFound = classes.length;

    const m3Units = await this.m3UnitsCreate(classes);
    result.m3UnitsCreated = m3Units.length;

    result.tsUnitsLinked = await this.tsUnitsLink(m3Units, componentRoot);

    return result;
  }

  private async tsFileFind(componentRoot: string, className: string): Promise<string[]> {
    const results: string[] = [];
    const srcDir = path.join(componentRoot, 'src', 'ts');

    for (const layer of ['layer1', 'layer2', 'layer3', 'layer4', 'layer5']) {
      const layerDir = path.join(srcDir, layer);
      if (!fs.existsSync(layerDir)) continue;

      const targetFile = path.join(layerDir, `${className}.ts`);
      if (fs.existsSync(targetFile)) {
        results.push(targetFile);
      }
    }

    return results;
  }
}
