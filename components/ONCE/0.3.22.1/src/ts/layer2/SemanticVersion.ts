/**
 * SemanticVersion - Semantic version component (X.Y.Z.W format)
 * 
 * Radical OOP: Version is behavior + data, not just string manipulation
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import type { Version } from '../layer3/Version.interface.js';
import type { VersionModel } from '../layer3/VersionModel.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { MethodSignature } from '../layer3/MethodSignature.interface.js';
import { randomUUID } from 'crypto';

export class SemanticVersion implements Version {
  model!: VersionModel;

  /** Semantic link names for version management */
  static readonly SEMANTIC_LINKS = ['latest', 'dev', 'test', 'prod'] as const;
  static readonly SEMANTIC_LINKS_SET = new Set(SemanticVersion.SEMANTIC_LINKS);

  /** Empty constructor - Web4 Radical OOP */
  constructor() {}
  
  hasMethod(name: string): boolean {
    return false;
  }
  
  getMethodSignature(name: string): MethodSignature | null {
    return null;
  }
  
  listMethods(): string[] {
    return [];
  }

  /** Initialize with optional scenario */
  init(scenario?: Scenario<VersionModel>): this {
    if (!this.model) {
      this.model = {
        uuid: randomUUID(),
        name: 'version',
        major: 0,
        minor: 0,
        patch: 0,
        revision: 0,
        versionString: '0.0.0.0'
      };
    }
    
    if (scenario?.model) {
      this.model = { ...this.model, ...scenario.model };
    }
    
    return this;
  }

  /**
   * Factory method: Create from version string
   * @deprecated Web4 P26: Use `new SemanticVersion().init().parse(version)` instead
   */
  static fromString(version: string): SemanticVersion {
    const v = new SemanticVersion().init();
    v.parse(version);
    return v;
  }

  /** Parse version string to model */
  parse(version: string): this {
    if (!this.isValid(version)) {
      throw new Error(`Invalid version format: ${version}. Expected X.Y.Z.W`);
    }
    
    const parts = version.split('.').map(p => parseInt(p, 10));
    this.model.major = parts[0];
    this.model.minor = parts[1];
    this.model.patch = parts[2];
    this.model.revision = parts[3];
    this.model.versionString = version;
    
    return this;
  }

  /** Validate version string format (X.Y.Z.W) */
  isValid(version: string): boolean {
    const pattern = /^\d+\.\d+\.\d+\.\d+$/;
    return pattern.test(version);
  }

  /** Convert to string representation */
  toString(): string {
    return this.model.versionString;
  }

  /** Compare versions (-1 if less, 0 if equal, 1 if greater) */
  compareTo(other: Version): number {
    const otherModel = other.model;
    
    if (this.model.major !== otherModel.major) {
      return this.model.major < otherModel.major ? -1 : 1;
    }
    if (this.model.minor !== otherModel.minor) {
      return this.model.minor < otherModel.minor ? -1 : 1;
    }
    if (this.model.patch !== otherModel.patch) {
      return this.model.patch < otherModel.patch ? -1 : 1;
    }
    if (this.model.revision !== otherModel.revision) {
      return this.model.revision < otherModel.revision ? -1 : 1;
    }
    
    return 0;
  }

  /** Compare two version strings */
  static compare(a: string, b: string): number {
    const versionA = SemanticVersion.fromString(a);
    const versionB = SemanticVersion.fromString(b);
    return versionA.compareTo(versionB);
  }

  /** Get highest version from array */
  static getHighest(versions: string[]): string {
    if (versions.length === 0) {
      throw new Error('Cannot get highest version from empty array');
    }
    return versions.sort((a, b) => SemanticVersion.compare(b, a))[0];
  }

  /** Promote to next major version (immutable) */
  async promoteMajor(): Promise<Version> {
    const newVersion = new SemanticVersion().init();
    newVersion.model.major = this.model.major + 1;
    newVersion.model.minor = 0;
    newVersion.model.patch = 0;
    newVersion.model.revision = 0;
    newVersion.model.versionString = `${newVersion.model.major}.${newVersion.model.minor}.${newVersion.model.patch}.${newVersion.model.revision}`;
    return newVersion;
  }

  /** Promote to next minor version (immutable) */
  async promoteMinor(): Promise<Version> {
    const newVersion = new SemanticVersion().init();
    newVersion.model.major = this.model.major;
    newVersion.model.minor = this.model.minor + 1;
    newVersion.model.patch = 0;
    newVersion.model.revision = 0;
    newVersion.model.versionString = `${newVersion.model.major}.${newVersion.model.minor}.${newVersion.model.patch}.${newVersion.model.revision}`;
    return newVersion;
  }

  /** Promote to next patch version (immutable) */
  async promotePatch(): Promise<Version> {
    const newVersion = new SemanticVersion().init();
    newVersion.model.major = this.model.major;
    newVersion.model.minor = this.model.minor;
    newVersion.model.patch = this.model.patch + 1;
    newVersion.model.revision = 0;
    newVersion.model.versionString = `${newVersion.model.major}.${newVersion.model.minor}.${newVersion.model.patch}.${newVersion.model.revision}`;
    return newVersion;
  }

  /** Promote to next revision (immutable) */
  async promoteRevision(): Promise<Version> {
    const newVersion = new SemanticVersion().init();
    newVersion.model.major = this.model.major;
    newVersion.model.minor = this.model.minor;
    newVersion.model.patch = this.model.patch;
    newVersion.model.revision = this.model.revision + 1;
    newVersion.model.versionString = `${newVersion.model.major}.${newVersion.model.minor}.${newVersion.model.patch}.${newVersion.model.revision}`;
    return newVersion;
  }

  /** Promote version by type */
  static async promote(currentVersionString: string, promotionType: string): Promise<string> {
    if (promotionType.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return promotionType;
    }

    const version = SemanticVersion.fromString(currentVersionString);
    
    switch (promotionType) {
      case 'nextBuild':
      case 'build':
        return (await version.promoteRevision()).toString();
      case 'nextPatch':
      case 'patch':
        return (await version.promotePatch()).toString();
      case 'nextMinor':
      case 'minor':
        return (await version.promoteMinor()).toString();
      case 'nextMajor':
      case 'major':
        return (await version.promoteMajor()).toString();
      default:
        throw new Error(`Invalid version promotion type: ${promotionType}`);
    }
  }

  /** Check if string is a valid semantic link name */
  static isSemanticLink(link: string): boolean {
    return SemanticVersion.SEMANTIC_LINKS_SET.has(link as typeof SemanticVersion.SEMANTIC_LINKS[number]);
  }

  /** Convert to scenario for persistence */
  async toScenario(name?: string): Promise<Scenario<VersionModel>> {
    return {
      ior: {
        uuid: this.model.uuid,
        component: 'SemanticVersion',
        version: this.model.versionString
      },
      owner: 'system',
      model: this.model
    };
  }
}

