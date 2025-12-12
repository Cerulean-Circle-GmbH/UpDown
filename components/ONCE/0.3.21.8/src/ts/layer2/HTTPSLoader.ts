/**
 * HTTPSLoader.ts
 * 
 * Web4 HTTPS Loader - ISOMORPHIC (Browser + Node.js)
 * Handles HTTPS transport with IOR profile failover
 * Uses fetch() API which works in both environments.
 * 
 * Protocol: 'https'
 * Purpose: HTTPS transport (TLS, TCP/IP)
 * Chain: ScenarioLoader → RESTLoader → HTTPSLoader → Network
 * 
 * Web4 P4: No arrow functions - all callbacks use bound methods
 * @pdca session/2025-12-12-UTC-1430.browser-client-radical-oop.pdca.md
 */

import { Loader } from '../layer3/Loader.interface.js';
import { LoaderModel } from '../layer3/LoaderModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';

/**
 * IOR Profile
 * Multiple host:port pairs for failover
 */
interface IORProfile {
    host: string;
    port: number;
}

/**
 * HTTPSLoader
 * 
 * Transport-level loader (bottom of stack)
 * Handles actual HTTPS requests with failover
 * Supports IOR profiles (CORBA 2.3+ pattern)
 */
export class HTTPSLoader implements Loader {
    public protocol = 'https';
    public model: LoaderModel;
    
    constructor() {
        // Empty constructor - UUID provided by ONCE kernel via init()
        const now = new Date().toISOString();
        this.model = {
            uuid: '',  // Set by init()
            name: 'HTTPSLoader',
            protocol: 'https',
            statistics: {
                totalOperations: 0,
                successCount: 0,
                errorCount: 0,
                lastOperationAt: '',
                lastErrorAt: '',
                createdAt: now,
                updatedAt: now
            }
        };
    }
    
    /**
     * Load via HTTPS with profile failover
     * 
     * Parses: https://primary.host:8080,failover.host:8081/path
     * Tries each profile in order until success
     * Returns: Response body (string)
     */
    public async load(ior: string, options?: any): Promise<string> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        const profiles = this.extractProfiles(ior);
        
        // Try each profile in order (failover)
        for (let i = 0; i < profiles.length; i++) {
            const profile = profiles[i];
            
            try {
                const url = this.buildURL(profile, ior);
                console.log(`📡 HTTPSLoader: Trying profile ${i + 1}/${profiles.length}: ${profile.host}:${profile.port}`);
                
                const response = await fetch(url, {
                    method: options?.method || 'GET',
                    headers: options?.headers || {},
                    body: options?.body
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const body = await response.text();
                
                this.model.statistics.successCount++;
                
                console.log(`✅ HTTPSLoader: Success with profile ${profile.host}:${profile.port}`);
                return body;
                
            } catch (error: any) {
                console.warn(`⚠️  HTTPSLoader: Profile ${profile.host}:${profile.port} failed: ${error.message}`);
                
                // If this was the last profile, throw error
                if (i === profiles.length - 1) {
                    this.model.statistics.errorCount++;
                    this.model.statistics.lastErrorAt = now;
                    throw new Error(`All IOR profiles exhausted for: ${ior}`);
                }
                
                // Otherwise, continue to next profile
            }
        }
        
        throw new Error(`HTTPSLoader: No profiles to try`);
    }
    
    /**
     * Save via HTTPS with profile failover
     */
    public async save(data: string, ior: string, options?: any): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        const profiles = this.extractProfiles(ior);
        
        // Try each profile in order
        for (let i = 0; i < profiles.length; i++) {
            const profile = profiles[i];
            
            try {
                const url = this.buildURL(profile, ior);
                
                const response = await fetch(url, {
                    method: options?.method || 'POST',
                    headers: options?.headers || { 'Content-Type': 'application/json' },
                    body: data
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                this.model.statistics.successCount++;
                
                return; // Success
                
            } catch (error: any) {
                console.warn(`⚠️  HTTPSLoader: Save failed on ${profile.host}:${profile.port}: ${error.message}`);
                
                if (i === profiles.length - 1) {
                    this.model.statistics.errorCount++;
                    this.model.statistics.lastErrorAt = now;
                    throw new Error(`All IOR profiles exhausted for save: ${ior}`);
                }
            }
        }
    }
    
    /**
     * Extract IOR profiles from URL
     * 
     * Web4 P4: Uses bound method instead of arrow function
     * 
     * @example
     * https://host1:8080,host2:8081,host3:8082/path
     * → [{ host: "host1", port: 8080 }, { host: "host2", port: 8081 }, ...]
     */
    private extractProfiles(ior: string): IORProfile[] {
        // Parse: ior:scenario:REST:https://host1:port1,host2:port2/path
        // Extract just the https://... part
        const match = ior.match(/https:\/\/([^\/]+)/);
        if (!match) {
            throw new Error(`Invalid HTTPS IOR format: ${ior}`);
        }
        
        const hostPortString = match[1];
        const hostPorts = hostPortString.split(',');
        
        // P4 FIX: Use forEach with bound method instead of map with arrow
        const profiles: IORProfile[] = [];
        hostPorts.forEach(this.hostPortProfileParse.bind(this, profiles));
        return profiles;
    }
    
    /**
     * Parse single host:port string into IORProfile
     * 
     * Web4 P4: Named method for .forEach() callback
     * 
     * @param profiles - Array to push parsed profile into
     * @param hostPort - String like "host:port"
     */
    private hostPortProfileParse(profiles: IORProfile[], hostPort: string): void {
        const [host, portStr] = hostPort.split(':');
        profiles.push({
            host: host.trim(),
            port: parseInt(portStr, 10)
        });
    }
    
    /**
     * Build full URL from profile and IOR path
     * 
     * @param profile - { host, port }
     * @param ior - Full IOR string
     * @returns Complete URL for this profile
     */
    private buildURL(profile: IORProfile, ior: string): string {
        // Extract path from IOR
        // ior:scenario:REST:https://host1:port1,host2:port2/Component/version/uuid/method
        // → /Component/version/uuid/method
        
        const pathMatch = ior.match(/https:\/\/[^\/]+(\/.*)/);
        const path = pathMatch ? pathMatch[1] : '/';
        
        return `https://${profile.host}:${profile.port}${path}`;
    }
    
    /**
     * Empty constructor pattern - init with scenario
     */
    public init(scenario?: Scenario<LoaderModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        return this;
    }
    
    /**
     * Convert to scenario (async to match Component interface)
     */
    public async toScenario(): Promise<Scenario<LoaderModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: 'HTTPSLoader',
                version: '0.3.21.8'
            },
            owner: '',
            model: this.model
        };
    }
}

