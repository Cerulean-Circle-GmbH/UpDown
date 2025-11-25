/**
 * Scenario Manager v0.3.21.1 - Handles scenario-based configuration and storage
 * ✅ Supports both legacy and Web4 Standard formats
 * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
 */

import { LegacyONCEScenario } from '../layer3/LegacyONCEScenario.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { ScenarioTypeGuard } from '../layer1/ScenarioTypeGuard.js';
import { ONCEServerModel } from '../layer3/ONCEServerModel.interface.js';
import { DefaultUser } from './DefaultUser.js';
import { NodeOSInfrastructure } from '../layer1/NodeOSInfrastructure.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import { logAction, serverIdentity } from '../layer1/LoggingUtils.js';

/**
 * Scenario Manager - handles ONCE scenario storage and loading
 * Implements organized directory structure: /scenarios/domain/component/version/uuid.json
 * ✅ TRUE Radical OOP: Uses backward link for path authority
 */
export class ScenarioManager {
    private _projectRoot: string | undefined;
    component?: any; // Backward link to DefaultONCE for path authority

    constructor(projectRoot?: string) {
        // Allow explicit projectRoot override, otherwise derive from component path
        this._projectRoot = projectRoot;
    }

    /**
     * Get version via path authority
     * ✅ TRUE Radical OOP: Query parent first, fallback to own path extraction
     */
    private get version(): string {
        // First: try backward link to component
        if (this.component?.model?.version) {
            return this.component.model.version;
        }
        
        // Fallback: extract from own path
        const currentFile = fileURLToPath(import.meta.url);
        const match = currentFile.match(/ONCE\/(\d+\.\d+\.\d+\.\d+)/);
        return match ? match[1] : 'unknown';
    }

    /**
     * Get project root - derive from component path if not explicitly set
     * ✅ TRUE Radical OOP: Uses path authority hierarchy
     */
    private get projectRoot(): string {
        // Explicit override takes precedence
        if (this._projectRoot) {
            return this._projectRoot;
        }
        
        // Path authority: Use backward link to component instance if available
        if (this.component?.model?.projectRoot) {
            return this.component.model.projectRoot;
        }
        
        // Fallback: derive from component path properly
        const currentFile = fileURLToPath(import.meta.url);
        const currentDir = dirname(currentFile);
        // From dist/ts/layer2/ go up to component root, then to project root
        const componentRoot = resolve(currentDir, '../../../'); // -> 0.3.20.X
        const onceDir = resolve(componentRoot, '..'); // -> ONCE
        const componentsDir = resolve(onceDir, '..'); // -> components
        return resolve(componentsDir, '..'); // -> project root
    }

    /**
     * Save scenario to organized directory structure
     * /scenarios/{domain-parts}/{hostname}/component/version/uuid.scenario.json
     * ✅ Accepts both legacy and Web4 formats
     * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
     */
    async saveScenario(scenario: LegacyONCEScenario | Scenario<LegacyONCEScenario>): Promise<string> {
        // Use type guard to extract legacy data
        const guard = new ScenarioTypeGuard();
        guard.init(scenario);
        
        let legacyData: LegacyONCEScenario;
        if (guard.isWeb4()) {
            // Extract legacy from Web4 wrapper
            const web4 = guard.asWeb4<LegacyONCEScenario>()!;
            legacyData = web4.model;
        } else {
            // Already legacy format
            legacyData = guard.asLegacy()!;
        }
        
        const component = legacyData.objectType;
        const version = legacyData.version;
        const uuid = legacyData.uuid;
        
        // Extract domain and hostname from metadata
        const fullDomain = legacyData.metadata.domain || 'local.once';
        const fqdn = legacyData.metadata.host || 'localhost';
        
        // Parse domain into path components
        let domainPath: string[];
        let hostname: string;
        
        if (fqdn === 'localhost') {
            domainPath = ['local', 'once'];
            hostname = 'localhost';
        } else if (fqdn.includes('.')) {
            const parts = fqdn.split('.');
            hostname = parts[0]; // First part is hostname
            const domainParts = parts.slice(1); // Rest is domain
            domainPath = domainParts.reverse(); // Reverse for proper hierarchy
        } else {
            // Simple hostname
            domainPath = ['local', fqdn];
            hostname = fqdn;
        }

        // Create organized path: scenarios/{domain-parts}/{hostname}/ONCE/version
        const scenarioDir = join(
            this.projectRoot,
            'scenarios',
            ...domainPath,
            hostname,
            component,
            version
        );

        // Ensure directory exists
        if (!existsSync(scenarioDir)) {
            mkdirSync(scenarioDir, { recursive: true });
        }

        const scenarioPath = join(scenarioDir, `${uuid}.scenario.json`);

        // Update modified timestamp
        legacyData.metadata.modified = new Date().toISOString();

        // Save the ORIGINAL format (preserve what was passed in)
        writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));
        console.log(`📝 [WRITE] ScenarioManager.saveScenario() projectRoot=${this.projectRoot} → ${scenarioPath}`);
        
        // Extract port from capabilities for logging (httpPort might not be in state)
        const httpCapability = legacyData.state.capabilities?.find((c: any) => c.capability === 'httpPort');
        const port = httpCapability?.port || legacyData.state.httpPort || 'unknown';
        
        logAction('💾', legacyData.uuid, 'Scenario saved', `${serverIdentity(legacyData.state.hostname, port)} → ${basename(scenarioPath)}`);
        return scenarioPath;
    }

    /**
     * Load scenario from file
     * ✅ Supports both legacy and Web4 formats (backward compatibility)
     * ✅ Transparently migrates legacy format on load
     * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
     */
    async loadScenario(scenarioPath: string): Promise<Scenario<LegacyONCEScenario>> {
        if (!existsSync(scenarioPath)) {
            throw new Error(`Scenario file not found: ${scenarioPath}`);
        }

        const content = readFileSync(scenarioPath, 'utf8');
        const data = JSON.parse(content);
        
        // Use type guard to detect format
        const guard = new ScenarioTypeGuard();
        guard.init(data);
        
        if (guard.isLegacy()) {
            // Legacy format - migrate transparently
            console.log(`📂 Loading legacy scenario: ${basename(scenarioPath)}`);
            return await this.migrateLegacyScenario(guard.asLegacy()!);
        } else {
            // Already Web4 format
            console.log(`📂 Loading Web4 scenario: ${basename(scenarioPath)}`);
            return guard.asWeb4<LegacyONCEScenario>()!;
        }
    }
    
    /**
     * Migrate legacy scenario to Web4 format
     * ✅ Uses insourced DefaultUser for owner generation
     * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
     */
    private async migrateLegacyScenario(legacy: LegacyONCEScenario): Promise<Scenario<LegacyONCEScenario>> {
        // Generate owner using insourced DefaultUser (same pattern as DefaultONCE.toScenario)
        let ownerData: string;
        try {
            const infrastructure = new NodeOSInfrastructure();
            await infrastructure.init();
            const env = await infrastructure.detectEnvironment();
            const username = 'system';  // ✅ Fallback - no process.env in production code
            
            // Pass projectRoot to ensure User saves in correct location
            const user = await DefaultUser.create(username, infrastructure, this.projectRoot);
            const userScenario = await user.toScenario();
            const ownerJson = JSON.stringify(userScenario);
            ownerData = Buffer.from(ownerJson).toString('base64');
        } catch (error) {
            // Fallback: Generate minimal User-like scenario
            const fallbackJson = JSON.stringify({
                ior: {
                    uuid: legacy.uuid,
                    component: 'User',
                    version: '0.3.21.1',
                    timestamp: new Date().toISOString()
                },
                owner: '',
                model: {
                    user: 'system',
                    hostname: legacy.metadata.host || 'localhost',
                    uuid: legacy.uuid,
                    component: legacy.objectType,
                    version: legacy.version
                }
            });
            ownerData = Buffer.from(fallbackJson).toString('base64');
        }
        
        // Return Web4 Standard format
        return {
            ior: {
                uuid: legacy.uuid,
                component: legacy.objectType,
                version: legacy.version
            },
            owner: ownerData,
            model: legacy  // ✅ ENTIRE legacy scenario
        };
    }

    /**
     * Load scenario by UUID, domain/hostname, component, and version
     * Note: This method needs domain AND hostname or full FQDN to construct the path
     * ✅ Returns Web4 format (migrates legacy transparently)
     */
    async loadScenarioByUUID(
        uuid: string, 
        fqdn: string = 'localhost',
        component: string = 'ONCE', 
        version?: string
    ): Promise<Scenario<LegacyONCEScenario>> {
        // ✅ Use dynamic version if not provided
        const actualVersion = version || this.version;
        
        // Parse FQDN into domain path and hostname
        let domainPath: string[];
        let hostname: string;
        
        if (fqdn === 'localhost') {
            domainPath = ['local', 'once'];
            hostname = 'localhost';
        } else if (fqdn.includes('.')) {
            const parts = fqdn.split('.');
            hostname = parts[0];
            const domainParts = parts.slice(1);
            domainPath = domainParts.reverse();
        } else {
            domainPath = ['local', fqdn];
            hostname = fqdn;
        }
        
        const scenarioPath = join(
            this.projectRoot,
            'scenarios',
            ...domainPath,
            hostname,
            component,
            actualVersion,
            `${uuid}.scenario.json`
        );

        return this.loadScenario(scenarioPath);
    }

    /**
     * Create scenario from server model
     * ✅ Returns legacy format (will be wrapped by DefaultONCE.toScenario)
     */
    createScenarioFromServerModel(serverModel: ONCEServerModel): LegacyONCEScenario {
        return {
            uuid: serverModel.uuid,
            name: serverModel.name || `ONCE-${serverModel.uuid.slice(0, 8)}`, // Web4 Principle 1a: Model requires name
            objectType: 'ONCE',
            version: this.version, // ✅ Use dynamic version
            state: {
                ...serverModel,
                // Remove circular references and non-serializable data
                platform: {
                    ...serverModel.platform,
                    // Keep only serializable platform data
                }
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                creator: `ONCE-v${this.version}`, // ✅ Use dynamic version
                description: `ONCE server ${serverModel.isPrimaryServer ? 'Primary' : 'Client'} server instance`,
                tags: ['server', 'once', serverModel.isPrimaryServer ? 'primary' : 'client'],
                domain: serverModel.domain,
                host: serverModel.host,
                port: serverModel.capabilities.find(c => c.capability === 'httpPort')?.port,
                isPrimaryServer: serverModel.isPrimaryServer
            }
        };
    }

    /**
     * Create server model from scenario
     * ✅ Accepts Web4 Standard format
     */
    createServerModelFromScenario(scenario: Scenario<LegacyONCEScenario>): ONCEServerModel {
        if (scenario.ior.component !== 'ONCE') {
            throw new Error(`Invalid scenario type for server model: ${scenario.ior.component}`);
        }

        return scenario.model.state as ONCEServerModel;
    }

    /**
     * Find scenarios by pattern
     */
    async findScenarios(
        domain?: string,
        component?: string,
        version?: string
    ): Promise<string[]> {
        const scenariosPath = join(this.projectRoot, 'scenarios');
        const results: string[] = [];

        // TODO: Implement recursive directory scanning
        // For now, return empty array
        console.log(`🔍 Scenario search requested: domain=${domain}, component=${component}, version=${version}`);
        
        return results;
    }

    /**
     * Get project root (no environment variables)
     */
    getProjectRoot(): string {
        return this.projectRoot;
    }

    /**
     * Set project root
     */
    setProjectRoot(projectRoot: string): void {
        this._projectRoot = projectRoot;
    }
}

