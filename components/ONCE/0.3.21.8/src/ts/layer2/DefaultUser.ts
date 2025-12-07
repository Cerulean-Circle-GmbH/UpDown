/**
 * DefaultUser - User component implementation
 * Web4 EAM Layer 2 - Concrete implementation
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 */

import { createHash } from 'crypto';
import { User } from '../layer3/User.interface.js';
import { UserModel } from '../layer3/UserModel.interface.js';
import { Model } from '../layer3/Model.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { NodeOSInfrastructure } from '../layer1/NodeOSInfrastructure.js';
import { EnvironmentModel } from '../layer3/EnvironmentModel.interface.js';

export class DefaultUser implements User {
  private model: UserModel;
  private infrastructure: NodeOSInfrastructure;

  /**
   * Create User instance - JavaBean pattern: empty constructor
   */
  constructor() {
    this.model = {
      uuid: '',
      name: '', // Web4 Principle 1a: Model requires name
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
      // Auto-detect if no scenario provided
      this.model.username = process.env.USER || 'unknown';
      this.model.name = this.model.username; // Use username as display name
      this.model.uuid = this.getUserUUID(this.model.username);
      // hostname will be set by detectEnvironment
      this.model.hostname = 'localhost';
    }
    return this;
  }
  
  /**
   * Detect and set environment (hostname, FQDN)
   * Separate method to support async detection
   */
  public async detectEnvironment(): Promise<void> {
    try {
      const env: EnvironmentModel = await this.infrastructure.detectEnvironment();
      this.model.hostname = env.getFqdn();
    } catch (error) {
      console.warn('⚠️  Failed to detect hostname, using fallback:', error);
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
   * Generate a deterministic UUID v4 based on username
   * This ensures the same user always gets the same UUID
   */
  public getUserUUID(username: string): string {
    // Create a hash of the username
    const hash = createHash('sha256').update(`user:${username}`).digest('hex');
    
    // Format as UUID v4 (but deterministic, not random)
    const uuid = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      '4' + hash.substring(13, 16), // Version 4
      ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20), // Variant
      hash.substring(20, 32)
    ].join('-');
    
    return uuid;
  }

  /**
   * Convert to scenario for hibernation - Web4 pattern
   */
  public async toScenario(): Promise<Scenario<UserModel>> {
    const utcTimestamp = new Date().toISOString();
    
    // Create owner data (system user creates all users)
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
        version: '0.3.21.1'
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
    projectRoot?: string
  ): Promise<DefaultUser> {
    const user = new DefaultUser();
    if (infrastructure) {
      user.setInfrastructure(infrastructure);
    }
    user.init(); // Initialize with auto-detected values
    user.model.username = username || process.env.USER || 'unknown';
    user.model.uuid = user.getUserUUID(user.model.username);
    await user.detectEnvironment();
    
    // ✅ Auto-save if projectRoot provided
    // @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
    if (projectRoot) {
      await user.saveScenario(projectRoot);
    }
    
    return user;
  }
  
  /**
   * Get scenario save path using same logic as ONCE
   * ✅ Dynamic based on detected domain/hostname
   * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
   */
  private async getScenarioPath(projectRoot: string): Promise<string> {
    const path = await import('path');
    
    // Use infrastructure to calculate path components (DRY)
    const { domainPath, hostname } = this.infrastructure.getScenarioPathComponents(this.model.hostname);
    
    // Same structure as ONCE: scenarios/domain/{domain}/{hostname}/User/{version}
    const scenarioDir = path.join(
      projectRoot,
      'scenarios',
      'domain',           // ✅ Added domain/ prefix for consistency
      ...domainPath,
      hostname,
      'User',
      '0.3.21.1'
    );
    
    return path.join(scenarioDir, `${this.model.uuid}.scenario.json`);
  }
  
  /**
   * Save User scenario to hierarchical path (like ONCE does)
   * ✅ Uses same path logic as ServerHierarchyManager
   * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
   */
  public async saveScenario(projectRoot: string): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');
    
    // Generate scenario data
    const scenario = await this.toScenario();
    
    // Calculate dynamic path
    const scenarioPath = await this.getScenarioPath(projectRoot);
    const scenarioDir = path.dirname(scenarioPath);
    
    // Ensure directory exists
    if (!fs.existsSync(scenarioDir)) {
      fs.mkdirSync(scenarioDir, { recursive: true });
    }
    
    // Save scenario
    fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));
    console.log(`📝 [WRITE] DefaultUser.saveScenario() projectRoot=${projectRoot} → ${scenarioPath}`);
    console.log(`💾 User scenario saved: ${path.basename(scenarioPath)}`);
    
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

