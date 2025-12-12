/**
 * ScenarioRoute.ts
 * 
 * Web4 Scenario Route
 * Returns Scenario<T> objects (primary Web4 route type)
 * 
 * @layer2
 * @pattern Radical OOP - All state in model, returns Scenario<T>
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

import { Route } from './Route.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';

/**
 * Scenario Provider
 * Function that returns a Scenario<T>
 * T can be any model type
 */
export type ScenarioProvider = (req: IncomingMessage) => Promise<Scenario<any>>;

/**
 * ScenarioRoute
 * 
 * Web4 PRIMARY route type
 * - Returns Scenario<T> (typed object state)
 * - Never naked JSON
 * - Follows Web4 Radical OOP principles
 * 
 * Used for:
 * - /health → Scenario<HealthModel>
 * - /servers → Scenario<ServerListModel>
 * - Any IOR endpoint → Scenario<ComponentModel>
 * 
 * Architecture:
 * - Receives Scenario via provider function
 * - Serializes to JSON
 * - Sets correct headers
 * - Returns typed Scenario<T>
 */
export class ScenarioRoute extends Route {
    private scenarioProvider?: ScenarioProvider;
    
    constructor() {
        super();
        this.model.name = 'ScenarioRoute';
    }
    
    /**
     * Get icon for scenario route (Radical OOP: polymorphism)
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.1
     */
    public override iconGet(): string {
        return '📊';
    }
    
    /**
     * Get label for scenario route group
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.1
     */
    public override labelGet(): string {
        return '📊 Scenario Endpoints';
    }
    
    /**
     * Set scenario provider function
     * 
     * @param provider - Function that returns Scenario<T>
     * @returns this (method chaining)
     */
    public setProvider(provider: ScenarioProvider): this {
        this.scenarioProvider = provider;
        return this;
    }
    
    /**
     * Set route pattern and method
     * 
     * @param pattern - URL pattern (e.g., "/health")
     * @param method - HTTP method (default: GET)
     * @returns this (method chaining)
     */
    public setPattern(pattern: string, method: HttpMethod = HttpMethod.GET): this {
        this.model.pattern = pattern;
        this.model.method = method;
        return this;
    }
    
    /**
     * Handle Scenario request
     * 
     * Web4 Pattern:
     * - Get Scenario<T> from provider
     * - Serialize to JSON
     * - Set headers
     * - Write response
     * - Update statistics (via base class)
     * 
     * ✅ Returns typed Scenario<T>
     * ❌ Never returns naked JSON
     */
    protected async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        if (!this.scenarioProvider) {
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                error: 'ScenarioRoute: No scenario provider configured' 
            }));
            return;
        }
        
        try {
            const scenario = await this.scenarioProvider(req);
            
            // Validate it's a proper Scenario<T>
            if (!scenario || !scenario.ior || !scenario.model) {
                throw new Error('Provider must return a valid Scenario<T>');
            }
            
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(scenario, null, 2));
        } catch (error: any) {
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                error: `ScenarioRoute error: ${error.message}` 
            }));
        }
    }
}

