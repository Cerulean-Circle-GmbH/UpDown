/**
 * DefaultUser - User component implementation
 * Web4 EAM Layer 2 - Concrete implementation
 */

import { createHash } from 'crypto';
import { User } from '../layer3/User.interface.js';
import { UserModel } from '../layer3/UserModel.interface.js';
import { Model } from '../layer3/Model.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { NodeOSInfrastructure } from '../layer1/NodeOSInfrastructure.js';
import { EnvironmentModel } from '../layer3/EnvironmentModel.interface.js';
import type { PersistenceManager } from '../layer3/PersistenceManager.interface.js';
import type { ScenarioService } from '@web4x/unit/dist/ts/layer2/ScenarioService.js';
import { IOR } from '@web4x/ucp/IOR';

export class DefaultUser implements User {
  private model: UserModel;
  private infrastructure: NodeOSInfrastructure;
  private persistenceManagerRef: PersistenceManager | null = null;
  private scenarioServiceRef: ScenarioService | null = null;

  /**
   * Create User instance - JavaBean pattern: empty constructor
   */
  constructor() {
    this.model = {
      uuid: '',
      name: '',
      username: '',
      hostname: ''
    };
    this.infrastructure = new NodeOSInfrastructure();
  }

  /**
   * Initialize from scenario - Web4 pattern
   */
  public init(scenario?: Scenario<Model>): this {
    if (scenario && scenario.model) {
      this.model = { ...scenario.model } as UserModel;
    } else {
      this.model.username = process.env.USER || 'unknown';
      this.model.name = this.model.username;
      this.model.uuid = this.getUserUUID(this.model.username);
      this.model.hostname = 'localhost';
    }
    return this;
  }

  /**
   * Detect and set environment (hostname, FQDN)
   */
  public async detectEnvironment(): Promise<void> {
    try {
      const env: EnvironmentModel = await this.infrastructure.detectEnvironment();
      this.model.hostname = env.fqdn;
    } catch (error) {
      console.warn('Failed to detect hostname, using fallback:', error);
      this.model.hostname = process.env.HOSTNAME || 'localhost';
    }
  }

  // Getters following JavaBean pattern
  public getUuid(): string {
    return this.model.uuid;
  }

  public getUsername(): string {
    return this.model.username;
  }

  public getHostname(): string {
    return this.model.hostname;
  }

  // Setters following JavaBean pattern
  public setInfrastructure(infrastructure: NodeOSInfrastructure): void {
    this.infrastructure = infrastructure;
  }

  public getInfrastructure(): NodeOSInfrastructure {
    return this.infrastructure;
  }

  /**
   * Set PersistenceManager for index-based storage
   * @deprecated Use setScenarioService() instead
   */
  public setPersistenceManager(pm: PersistenceManager): void {
    this.persistenceManagerRef = pm;
  }

  /**
   * Set ScenarioService (single point of truth for scenarios)
   */
  public setScenarioService(ss: ScenarioService): void {
    this.scenarioServiceRef = ss;
  }

  /**
   * Generate a deterministic UUID v4 based on username
   */
  public getUserUUID(username: string): string {
    const hash = createHash('sha256').update(`user:${username}`).digest('hex');

    const uuid = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      '4' + hash.substring(13, 16),
      ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20),
      hash.substring(20, 32)
    ].join('-');

    return uuid;
  }

  /**
   * Convert to scenario for hibernation - Web4 pattern
   */
  public async toScenario(): Promise<Scenario<UserModel>> {
    const utcTimestamp = new Date().toISOString();

    const ownerData = {
      user: 'system',
      hostname: 'system',
      utcTimestamp,
      uuid: this.getUserUUID('system')
    };

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'User',
        version: '0.3.23.0'
      },
      owner: Buffer.from(JSON.stringify(ownerData)).toString('base64'),
      model: this.model
    };
  }

  /**
   * Static factory method to create and initialize User
   */
  public static async create(
    username?: string,
    infrastructure?: NodeOSInfrastructure,
    projectRoot?: string,
    scenarioService?: ScenarioService
  ): Promise<DefaultUser> {
    const user = new DefaultUser();
    if (infrastructure) {
      user.setInfrastructure(infrastructure);
    }
    if (scenarioService) {
      user.setScenarioService(scenarioService);
    }
    user.init();
    user.model.username = username || process.env.USER || 'unknown';
    user.model.uuid = user.getUserUUID(user.model.username);
    await user.detectEnvironment();

    if (projectRoot) {
      await user.saveScenario(projectRoot);
    }

    return user;
  }

  /**
   * Get scenario save path using same logic as ONCE
   */
  private async getScenarioPath(projectRoot: string): Promise<string> {
    const path = await import('path');

    const { domainPath, hostname } = this.infrastructure.getScenarioPathComponents(this.model.hostname);

    const scenarioDir = path.join(
      projectRoot,
      'scenarios',
      'domain',
      ...domainPath,
      hostname,
      'User',
      '0.3.23.0'
    );

    return path.join(scenarioDir, `${this.model.uuid}.scenario.json`);
  }

  /**
   * Save User scenario
   * Uses ScenarioService (single point of truth) when available
   * Falls back to legacy direct write
   */
  public async saveScenario(projectRoot: string): Promise<string> {
    const path = await import('path');

    const scenario = await this.toScenario();
    const uuid = this.model.uuid;

    const { domainPath, hostname } = this.infrastructure.getScenarioPathComponents(this.model.hostname);

    if (this.scenarioServiceRef) {
      try {
        const symlinkPaths: string[] = [
          this.scenarioServiceRef.typePathBuild('User', '0.3.23.0'),
          this.scenarioServiceRef.domainPathBuild(domainPath, hostname, 'User', '0.3.23.0')
        ];

        await this.scenarioServiceRef.scenarioSave(scenario, symlinkPaths);
        console.log(`[PERSISTENCE] DefaultUser saved ${uuid} via ScenarioService`);
        return path.join(projectRoot, 'scenarios', 'index');
      } catch (error) {
        console.warn(`ScenarioService failed for User, falling back to legacy: ${error}`);
      }
    }

    return this.saveScenarioLegacy(projectRoot, scenario);
  }

  /**
   * Legacy save method (fallback when ScenarioService not available)
   */
  private async saveScenarioLegacy(projectRoot: string, scenario: Scenario<UserModel>): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');

    const scenarioPath = await this.getScenarioPath(projectRoot);
    const scenarioDir = path.dirname(scenarioPath);

    if (!fs.existsSync(scenarioDir)) {
      fs.mkdirSync(scenarioDir, { recursive: true });
    }

    const saveIor = new IOR<string>().initRemote(`ior:file://${scenarioPath}`);
    await saveIor.save(scenario);
    console.log(`[WRITE] DefaultUser.saveScenarioLegacy() via IOR -> ${scenarioPath}`);

    return scenarioPath;
  }

  /**
   * Static method to get consistent owner object for any component
   */
  public static async getOwnerObject(
    username?: string,
    infrastructure?: NodeOSInfrastructure
  ): Promise<{user: string, hostname: string, utcTimestamp: string, uuid: string}> {
    const user = await DefaultUser.create(username, infrastructure);
    const utcTimestamp = new Date().toISOString();

    return {
      user: user.getUsername(),
      hostname: user.getHostname(),
      utcTimestamp,
      uuid: user.getUuid()
    };
  }

  /**
   * Static method to generate base64-encoded owner string
   */
  public static async getOwnerBase64(
    username?: string,
    infrastructure?: NodeOSInfrastructure
  ): Promise<string> {
    const ownerObject = await DefaultUser.getOwnerObject(username, infrastructure);
    return Buffer.from(JSON.stringify(ownerObject)).toString('base64');
  }
}
