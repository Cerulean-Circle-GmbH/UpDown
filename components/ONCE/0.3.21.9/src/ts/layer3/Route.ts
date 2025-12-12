/**
 * Route - Web4 Radical OOP Route Class
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 6: Empty Constructor Makes Factories Obsolete
 * ✅ Web4 Principle 19: One File One Type
 * ✅ Web4 Principle 26: No Factory Functions - Class + init() Only
 * 
 * Routes are objects initialized via scenarios.
 * 
 * Usage:
 * ```typescript
 * // Create route with defaults
 * const route = await new Route().init({
 *   model: { pattern: '/', viewTag: 'once-over-view', title: 'Dashboard' }
 * });
 * 
 * // Or with full scenario
 * const route = await new Route().init(existingScenario);
 * ```
 * 
 * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
 */

import type { RouteModel, RouteScenario } from './RouteScenario.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * Partial scenario for Route initialization
 */
export interface RouteInitScenario {
  ior?: {
    uuid?: string;
    component?: string;
    version?: string;
  };
  owner?: string;
  model: Partial<RouteModel> & { pattern: string; viewTag: string };
}

/**
 * Route - Radical OOP route class
 * 
 * ✅ Web4 Principle 26: No Factory Functions
 * Use `new Route().init(scenario)` instead of factory functions.
 */
export class Route {
  
  // ═══════════════════════════════════════════════════════════════
  // SCENARIO STATE
  // ═══════════════════════════════════════════════════════════════
  
  /** Route scenario - the persistent state */
  protected scenario: Reference<RouteScenario> = null;
  
  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Empty constructor - Web4 Principle 6
   * All initialization happens in init()
   */
  constructor() {
    // Empty - see init()
  }
  
  /**
   * Initialize route from scenario
   * ✅ Web4 Principle 26: Class + init() pattern
   * 
   * @param scenario Partial or full route scenario
   * @returns this for chaining
   */
  async init(scenario: RouteInitScenario | RouteScenario): Promise<this> {
    const pattern = scenario.model.pattern;
    const routeId = scenario.ior?.uuid || `route-${pattern.replace(/[^a-z0-9]/gi, '-')}`;
    
    this.scenario = {
      ior: {
        uuid: routeId,
        component: scenario.ior?.component || 'ONCE',
        version: scenario.ior?.version || '0.3.21.8'
      },
      owner: scenario.owner || 'system',
      model: {
        // Model base properties
        uuid: routeId,
        name: scenario.model.title || scenario.model.name || `Route: ${pattern}`,
        // Route-specific properties
        pattern: pattern,
        viewTag: scenario.model.viewTag,
        title: scenario.model.title || scenario.model.viewTag,
        serverRoute: scenario.model.serverRoute || false,
        currentPath: scenario.model.currentPath || '',
        params: scenario.model.params || {},
        query: scenario.model.query || {},
        isActive: scenario.model.isActive || false,
        viewProps: scenario.model.viewProps || {}
      }
    };
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // SCENARIO ACCESS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get the full route scenario
   */
  toScenario(): RouteScenario {
    if (!this.scenario) {
      throw new Error('Route not initialized. Call init() first.');
    }
    return this.scenario;
  }
  
  /**
   * Get route model
   */
  get model(): RouteModel {
    if (!this.scenario) {
      throw new Error('Route not initialized. Call init() first.');
    }
    return this.scenario.model;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // MODEL ACCESSORS (Web4 P16: Object-Action naming)
  // ═══════════════════════════════════════════════════════════════
  
  /** Get pattern */
  get pattern(): string {
    return this.model.pattern;
  }
  
  /** Get view tag */
  get viewTag(): string {
    return this.model.viewTag;
  }
  
  /** Get title */
  get title(): string {
    return this.model.title;
  }
  
  /** Get/set current path */
  get currentPath(): string {
    return this.model.currentPath;
  }
  
  set currentPath(value: string) {
    this.model.currentPath = value;
  }
  
  /** Get/set params */
  get params(): Record<string, string> {
    return this.model.params;
  }
  
  set params(value: Record<string, string>) {
    this.model.params = value;
  }
  
  /** Get/set query */
  get query(): Record<string, string> {
    return this.model.query;
  }
  
  set query(value: Record<string, string>) {
    this.model.query = value;
  }
  
  /** Get/set isActive */
  get isActive(): boolean {
    return this.model.isActive;
  }
  
  set isActive(value: boolean) {
    this.model.isActive = value;
  }
  
  /** Get serverRoute flag */
  get serverRoute(): boolean {
    return this.model.serverRoute;
  }
  
  /** Get view props */
  get viewProps(): Record<string, unknown> {
    return this.model.viewProps;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ROUTE OPERATIONS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Activate this route with given path and params
   */
  activate(path: string, params: Record<string, string>, query: Record<string, string>): void {
    this.model.currentPath = path;
    this.model.params = params;
    this.model.query = query;
    this.model.isActive = true;
  }
  
  /**
   * Deactivate this route
   */
  deactivate(): void {
    this.model.isActive = false;
  }
  
  /**
   * Match URL path against this route's pattern
   * @returns params if match, null if no match
   */
  pathMatch(path: string): Record<string, string> | null {
    const patternParts = this.pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) {
      return null;
    }
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart.startsWith(':')) {
        // Dynamic segment - extract parameter
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart !== pathPart) {
        // Static segment doesn't match
        return null;
      }
    }
    
    return params;
  }
}





