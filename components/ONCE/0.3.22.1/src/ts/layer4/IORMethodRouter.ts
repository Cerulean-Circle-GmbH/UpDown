/**
 * IORMethodRouter.ts
 * 
 * Web4 IOR Method Router
 * Routes IOR URLs to component method invocations
 * 
 * Pattern: /{component}/{version}/{uuid}/{method}?param1=value1&param2=value2
 * Example: /ONCE/0.3.21.7/abc-123-def-456/healthGet
 * 
 * Principle: IORs act as extended URLs for method invocation
 * Replicates CLI behavior for HTTP endpoints
 * 
 * @layer2
 * @pdca session/2025-11-30-UTC-1724.iteration-05-httprouter-ior-routing.pdca.md
 */

import { Scenario } from '../layer3/Scenario.interface.js';
import { Model } from '../layer3/Model.interface.js';
import { IDProvider } from '../layer3/IDProvider.interface.js';
import { IORMethodCall } from '../layer3/IORMethodCall.interface.js';
import { UUIDProvider } from '../layer2/UUIDProvider.js';

// Re-export for backwards compatibility
export type { IORMethodCall } from '../layer3/IORMethodCall.interface.js';

/**
 * IORMethodRouter
 * 
 * Parses HTTP requests into method calls
 * Routes to component instances via ONCE kernel
 * 
 * Web4 Pattern: IOR-based method invocation
 * URL Structure: /{component}/{version}/{uuid}/{method}?params
 */
export class IORMethodRouter {
    public model: {
        uuid: string;
        name: string;
        iorComponent?: string;  // DRY: for toScenario()
        iorVersion?: string;    // DRY: from init(), never hardcode
        routeCount: number;
        successCount: number;
        errorCount: number;
        createdAt: string;
        updatedAt: string;
    };
    
    private onceKernel: any; // Reference to ONCE kernel for component lookup
    
    constructor() {
        // Empty constructor - Web4 pattern
        this.model = {
            uuid: '', // Set by init()
            name: 'IORMethodRouter',
            routeCount: 0,
            successCount: 0,
            errorCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    
    /**
     * Initialize router with ONCE kernel reference
     * 
     * Web4 Principle 6: init() is responsible for complete initialization
     * - Restores state from scenario if provided
     * - Generates UUID if not provided (using idProvider)
     * - Sets kernel reference for component lookup
     * 
     * @param scenario - Optional scenario to restore state
     * @param kernel - ONCE kernel instance for component lookup
     * @param idProvider - Optional ID provider (defaults to UUIDProvider)
     */
    public init(
        scenario: Scenario<any> | undefined, 
        kernel: any,
        idProvider: IDProvider = new UUIDProvider()
    ): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        // ✅ Web4 Principle 6: init() generates UUID if not provided
        if (!this.model.uuid) {
            this.model.uuid = idProvider.create();
        }
        this.onceKernel = kernel;
        return this;
    }
    
    /**
     * Parse IOR URL into method call
     * 
     * @param url - Request URL (e.g., "/ONCE/0.3.21.7/abc-123/healthGet?verbose=true")
     * @returns Parsed method call or null if invalid
     * 
     * @example
     * parseIorUrl("/ONCE/0.3.21.7/abc-123-def-456/healthGet")
     * → { componentName: "ONCE", componentVersion: "0.3.21.7", 
     *     instanceUuid: "abc-123-def-456", methodName: "healthGet", params: {} }
     */
    public parseIorUrl(url: string): IORMethodCall | null {
        try {
            // Parse URL
            const urlObj = new URL(url, 'http://localhost'); // Base URL for parsing
            const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
            
            // IOR path format: /{component}/{version}/{uuid}/{method}
            if (pathParts.length < 4) {
                return null; // Invalid IOR path
            }
            
            const [componentName, componentVersion, instanceUuid, methodName] = pathParts;
            
            // Parse query params (P4a: no arrow functions)
            const params: Record<string, string> = Object.fromEntries(urlObj.searchParams);
            
            return {
                componentName,
                componentVersion,
                instanceUuid,
                methodName,
                params
            };
        } catch (error) {
            console.error(`[IORMethodRouter] Failed to parse URL: ${url}`, error);
            return null;
        }
    }
    
    /**
     * Route IOR URL to component method invocation
     * 
     * @param url - Request URL
     * @param body - Optional request body (for POST/PUT)
     * @returns Method result (usually a Scenario)
     * 
     * Flow:
     * 1. Parse URL → IORMethodCall
     * 2. Lookup component instance in ONCE kernel
     * 3. Invoke method with params
     * 4. Return result as Scenario
     */
    public async route(url: string, body?: any): Promise<Scenario<any>> {
        this.model.routeCount++;
        this.model.updatedAt = new Date().toISOString();
        
        try {
            // Parse IOR URL
            const methodCall = this.parseIorUrl(url);
            if (!methodCall) {
                throw new Error(`Invalid IOR URL: ${url}`);
            }
            
            console.log(`[IORMethodRouter] Routing: ${methodCall.componentName}.${methodCall.methodName}(${JSON.stringify(methodCall.params)})`);
            
            // Lookup component instance
            const component = await this.lookupComponent(methodCall);
            if (!component) {
                throw new Error(`Component not found: ${methodCall.componentName}/${methodCall.componentVersion}/${methodCall.instanceUuid}`);
            }
            
            // Invoke method
            const result = await this.invokeMethod(component, methodCall, body);
            
            this.model.successCount++;
            this.model.updatedAt = new Date().toISOString();
            
            return result;
            
        } catch (error: any) {
            this.model.errorCount++;
            this.model.updatedAt = new Date().toISOString();
            
            console.error(`[IORMethodRouter] Routing failed:`, error);
            
            // Return error scenario
            return {
                ior: {
                    uuid: this.model.uuid,
                    component: this.model.iorComponent || 'IORMethodRouter',  // DRY
                    version: this.model.iorVersion || ''  // DRY: from init()
                },
                owner: '',
                model: {
                    uuid: this.model.uuid,
                    name: 'RoutingError',
                    error: error.message,
                    url,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
    
    /**
     * Lookup component instance in ONCE kernel
     * 
     * @param methodCall - Parsed method call
     * @returns Component instance or null
     */
    private async lookupComponent(methodCall: IORMethodCall): Promise<any> {
        if (!this.onceKernel) {
            throw new Error('ONCE kernel not initialized');
        }
        
        // Check if this is the ONCE kernel itself
        if (methodCall.componentName === 'ONCE' && 
            methodCall.instanceUuid === this.onceKernel.model?.uuid) {
            return this.onceKernel;
        }
        
        // Lookup in kernel's component registry
        // TODO: Implement component registry in ONCE kernel
        // For now, check kernel.model.peers for registered servers
        if (this.onceKernel.model?.peers) {
            const peer = this.onceKernel.model.peers.find((p: any) => 
                p.ior?.uuid === methodCall.instanceUuid
            );
            if (peer) {
                return peer; // Return peer scenario (it has model with state)
            }
        }
        
        return null;
    }
    
    /**
     * Invoke method on component
     * 
     * @param component - Component instance
     * @param methodCall - Parsed method call
     * @param body - Optional request body
     * @returns Method result (Scenario)
     * 
     * Strategy:
     * - Check if component has the method
     * - If yes: Call method with params, return result
     * - If no: Return component's current scenario (read-only access)
     */
    private async invokeMethod(
        component: any, 
        methodCall: IORMethodCall, 
        body?: any
    ): Promise<Scenario<any>> {
        const { methodName, params } = methodCall;
        
        // Check if component has the method
        if (typeof component[methodName] === 'function') {
            console.log(`[IORMethodRouter] Invoking: ${methodName}()`);
            
            // Invoke method with params
            const result = await component[methodName](params, body);
            
            // If result is already a Scenario, return it
            if (result && result.ior && result.model) {
                return result;
            }
            
            // Otherwise, wrap result in a scenario
            return {
                ior: {
                    uuid: component.model?.uuid || methodCall.instanceUuid,
                    component: methodCall.componentName,
                    version: methodCall.componentVersion
                },
                owner: '',
                model: result || component.model
            };
        }
        
        // Method not found - return component's current scenario (read-only)
        console.warn(`[IORMethodRouter] Method not found: ${methodName}, returning component scenario`);
        
        if (typeof component.toScenario === 'function') {
            return await component.toScenario();
        }
        
        // Fallback: Return raw component as scenario
        return {
            ior: {
                uuid: component.ior?.uuid || methodCall.instanceUuid,
                component: methodCall.componentName,
                version: methodCall.componentVersion
            },
            owner: '',
            model: component.model || component
        };
    }
    
    /**
     * Convert router state to scenario
     */
    public async toScenario(): Promise<Scenario<any>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: 'IORMethodRouter',
                version: '0.3.21.7'
            },
            owner: '',
            model: { ...this.model }
        };
    }
}

