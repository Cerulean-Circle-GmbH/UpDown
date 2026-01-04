/**
 * Scenario Manager v0.3.22.1 - Handles scenario-based configuration and storage
 * ✅ Uses Scenario<ONCEPeerModel> exclusively (no legacy formats)
 * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - Complete legacy elimination
 */

import { Scenario } from '../layer3/Scenario.interface.js';
// ONCEServerModel removed - using ONCEPeerModel (MC.1 complete)
import { ONCEPeerModel } from '../layer3/ONCEPeerModel.interface.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';
import { DefaultEnvironmentInfo } from './DefaultEnvironmentInfo.js';
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
     * ✅ Uses ScenarioService (single point of truth) for storage
     * ✅ Accepts only Scenario<ONCEPeerModel> (no legacy formats)
     * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - Complete legacy elimination
     */
    async saveScenario(scenario: Scenario<ONCEPeerModel>): Promise<string> {
        const model = scenario.model;
        
        const componentType = scenario.ior?.component || 'ONCE';
        const version = model.version;
        const uuid = model.uuid;
        
        // Extract domain and hostname from ONCEPeerModel
        const fqdn = model.host || 'localhost';
        const { domainPath, hostname } = this.parseFqdnToDomainPath(fqdn);
        
        // Extract port from ONCEPeerModel
        const capabilities = model.capabilities;
        const httpCapability = capabilities?.find((c: any) => c.capability === 'httpPort');
        const port = httpCapability?.port || model.port || 'unknown';

        // ✅ Try to use ScenarioService (single point of truth)
        const scenarioService = this.component?.scenarioServiceGet?.();
        if (scenarioService) {
            try {
                // Build symlink paths using ScenarioService's path builders
                const symlinkPaths: string[] = [
                    scenarioService.typePathBuild(componentType, version),
                    scenarioService.domainPathBuild(domainPath, hostname, componentType, version)
                ];
                
                if (port && port !== 'unknown') {
                    symlinkPaths.push(
                        scenarioService.capabilityPathBuild(
                            domainPath, hostname, componentType, version,
                            'httpPort', String(port)
                        )
                    );
                }
                
                await scenarioService.scenarioSave(scenario, symlinkPaths);
                const indexPath = join(this.projectRoot, 'scenarios', 'index');
                console.log(`📝 [PERSISTENCE] ScenarioManager saved ${uuid} via ScenarioService`);
                logAction('💾', uuid, 'Scenario saved (index)', `${serverIdentity(hostname, Number(port) || 0)}`);
                return indexPath; // Return index location
            } catch (error) {
                console.warn(`⚠️ ScenarioService failed, falling back to direct write: ${error}`);
            }
        }
        
        // ✅ Fallback: Direct file write
        return this.saveScenarioDirect(scenario, componentType, version, uuid, domainPath, hostname, port);
    }
    
    /**
     * Parse FQDN into domain path array and hostname
     */
    private parseFqdnToDomainPath(fqdn: string): { domainPath: string[], hostname: string } {
        if (fqdn === 'localhost') {
            return { domainPath: ['local', 'once'], hostname: 'localhost' };
        } else if (fqdn.includes('.')) {
            const parts = fqdn.split('.');
            const hostname = parts[0];
            const domainParts = parts.slice(1);
            return { domainPath: domainParts.reverse(), hostname };
        } else {
            return { domainPath: ['local', fqdn], hostname: fqdn };
        }
    }
    
    /**
     * Direct file save (fallback when ScenarioService not available)
     */
    private saveScenarioDirect(
        scenario: Scenario<ONCEPeerModel>,
        componentType: string,
        version: string,
        uuid: string,
        domainPath: string[],
        hostname: string,
        port: string | number
    ): string {
        // Create organized path: scenarios/domain/{domain-parts}/{hostname}/ONCE/version
        const scenarioDir = join(
            this.projectRoot,
            'scenarios',
            'domain',
            ...domainPath,
            hostname,
            componentType,
            version
        );

        // Ensure directory exists
        if (!existsSync(scenarioDir)) {
            mkdirSync(scenarioDir, { recursive: true });
        }

        const scenarioPath = join(scenarioDir, `${uuid}.scenario.json`);

        // Save the scenario
        writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));
        console.log(`📝 [WRITE] ScenarioManager.saveScenarioDirect() projectRoot=${this.projectRoot} → ${scenarioPath}`);
        
        logAction('💾', uuid, 'Scenario saved', `${serverIdentity(hostname, Number(port) || 0)} → ${basename(scenarioPath)}`);
        return scenarioPath;
    }

    /**
     * Load scenario from file
     * ✅ Supports both legacy and Web4 formats (backward compatibility)
     * ✅ Transparently migrates legacy format on load
     * ✅ Returns Scenario<ONCEPeerModel> (MC.3 migration)
     * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
     * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - MC.3
     */
    async loadScenario(scenarioPath: string): Promise<Scenario<ONCEPeerModel>> {
        if (!existsSync(scenarioPath)) {
            throw new Error(`Scenario file not found: ${scenarioPath}`);
        }

        const content = readFileSync(scenarioPath, 'utf8');
        const data = JSON.parse(content);
        
        // Directly return as Scenario<ONCEPeerModel>
        console.log(`📂 Loading scenario: ${basename(scenarioPath)}`);
        return data as Scenario<ONCEPeerModel>;
    }
    
    /**
     * Load scenario by UUID, domain/hostname, component, and version
     * Note: This method needs domain AND hostname or full FQDN to construct the path
     * ✅ Returns Scenario<ONCEPeerModel> (MC.3 migration)
     * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - MC.3
     */
    async loadScenarioByUUID(
        uuid: string, 
        fqdn: string = 'localhost',
        component: string = 'ONCE', 
        version?: string
    ): Promise<Scenario<ONCEPeerModel>> {
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
            'domain',           // ✅ Added domain/ prefix for consistency
            ...domainPath,
            hostname,
            component,
            actualVersion,
            `${uuid}.scenario.json`
        );

        return this.loadScenario(scenarioPath);
    }

    /**
     * Create scenario from peer model (unified ONCEPeerModel)
     * ✅ Accepts ONCEPeerModel directly (MC.1 migration complete)
     * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - MC.1
     */
    createScenarioFromServerModel(peerModel: ONCEPeerModel): Scenario<ONCEPeerModel> {
        return {
            ior: {
                uuid: peerModel.uuid,
                component: 'ONCE',
                version: this.version
            },
            owner: `ONCE-v${this.version}`,
            model: peerModel
        };
    }

    /**
     * Create server model from scenario
     * ✅ Returns ONCEPeerModel directly (MC.1 migration complete)
     * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - MC.1
     */
    createServerModelFromScenario(scenario: Scenario<ONCEPeerModel>): ONCEPeerModel {
        if (!scenario.ior || scenario.ior.component !== 'ONCE') {
            throw new Error(`Invalid scenario type for server model: ${scenario.ior?.component ?? 'unknown'}`);
        }

        // Return the model directly - ONCEPeerModel is now the unified model
        return scenario.model;
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

