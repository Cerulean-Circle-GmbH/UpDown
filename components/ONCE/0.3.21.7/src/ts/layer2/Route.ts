/**
 * Route.ts
 * 
 * Web4 Route Base Class
 * Abstract base for all HTTP route handlers
 * 
 * @layer2
 * @pattern Radical OOP - All state in model
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

import { RouteModel } from '../layer3/RouteModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import { IncomingMessage, ServerResponse } from 'http';

/**
 * Route (Abstract Base Class)
 * 
 * Web4 Radical OOP Route Pattern:
 * - Empty constructor (Web4 Principle 6)
 * - All state in model (Radical OOP)
 * - Return 'this' or Scenario<T> (never naked JSON)
 * - Can be "splintered out" into separate components
 * 
 * Architecture:
 * - Route owns its own model (RouteModel)
 * - Route can be registered in HTTPRouter
 * - Route can be hibernated to scenario
 * - Route can be restored from scenario
 */
export abstract class Route {
    public model: RouteModel;
    
    constructor() {
        // Empty constructor - Web4 Principle 6
        const now = new Date().toISOString();
        this.model = {
            uuid: '', // Set by init()
            name: 'Route',
            pattern: '', // Set by subclass
            method: HttpMethod.GET, // Default
            priority: 100, // Default priority (lower = higher priority)
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
     * Initialize route with scenario
     * Web4 Pattern: Empty constructor + init()
     * 
     * @param scenario - Optional scenario to restore state
     * @returns this (method chaining)
     */
    public init(scenario?: Scenario<RouteModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        return this;
    }
    
    /**
     * Check if this route matches the request
     * 
     * @param path - URL path (e.g., "/health")
     * @param method - HTTP method (GET, POST, etc.)
     * @returns true if route matches
     */
    public matches(path: string, method: HttpMethod): boolean {
        // Simple pattern matching (subclasses can override for regex, etc.)
        const methodMatches = this.model.method === method;
        const pathMatches = this.matchesPattern(path, this.model.pattern);
        return methodMatches && pathMatches;
    }
    
    /**
     * Pattern matching logic
     * Override in subclasses for complex patterns
     */
    protected matchesPattern(path: string, pattern: string): boolean {
        // Default: exact match
        return path === pattern;
    }
    
    /**
     * Handle HTTP request
     * 
     * Web4 Contract:
     * - Update model.statistics directly
     * - Return void (response written directly to ServerResponse)
     * - Subclasses implement specific logic
     * 
     * @param req - HTTP request
     * @param res - HTTP response
     */
    public async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            await this.handleRequest(req, res);
            this.model.statistics.successCount++;
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            throw error;
        }
    }
    
    /**
     * Subclass-specific request handling
     * Must be implemented by concrete route classes
     */
    protected abstract handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void>;
    
    /**
     * Convert to scenario
     * Web4 Pattern: All components can hibernate to scenarios
     * 
     * @returns Scenario representation
     */
    public async toScenario(): Promise<Scenario<RouteModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.constructor.name,
                version: '0.3.21.7'
            },
            owner: '',
            model: { ...this.model }
        };
    }
}

