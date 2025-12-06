/**
 * RouteScenario - Web4 Scenario for SPA Routes
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Routes are scenarios that define navigation targets.
 * They can be serialized, persisted, and discovered.
 * 
 * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
 */

import type { Scenario } from './Scenario.interface.js';
import type { Model } from './Model.interface.js';

/**
 * Route model - the state of a route
 * ✅ Extends Model for Web4 compliance
 */
export interface RouteModel extends Model {
  // Inherited from Model: uuid, name
  
  /** URL pattern with optional dynamic segments like :uuid */
  pattern: string;
  
  /** Custom element tag name to render (e.g., 'once-over-view') */
  viewTag: string;
  
  /** Page title for this route */
  title: string;
  
  /** Should server be notified of this route? */
  serverRoute: boolean;
  
  /** Current path (when route is active) */
  currentPath: string;
  
  /** Extracted URL parameters (from :segments) */
  params: Record<string, string>;
  
  /** Query string parameters (as object) */
  query: Record<string, string>;
  
  /** Is this route currently active? */
  isActive: boolean;
  
  /** Additional model props to pass to view */
  viewProps: Record<string, unknown>;
}

/**
 * RouteScenario - A route as a Web4 Scenario
 * 
 * Usage:
 * ```typescript
 * const route: RouteScenario = {
 *   ior: { uuid: 'route-dashboard', component: 'ONCE', version: '0.3.21.8' },
 *   owner: 'system',
 *   model: {
 *     pattern: '/',
 *     viewTag: 'once-over-view',
 *     title: 'ONCE Dashboard',
 *     serverRoute: false,
 *     currentPath: '',
 *     params: {},
 *     query: {},
 *     isActive: false,
 *     viewProps: {}
 *   }
 * };
 * ```
 */
export interface RouteScenario extends Scenario<RouteModel> {
  // Inherits ior, owner, model from Scenario<RouteModel>
}

/**
 * Create a new RouteScenario with defaults
 */
export function routeScenarioCreate(
  pattern: string,
  viewTag: string,
  options?: Partial<RouteModel>
): RouteScenario {
  const routeId = `route-${pattern.replace(/[^a-z0-9]/gi, '-')}`;
  return {
    ior: {
      uuid: routeId,
      component: 'ONCE',
      version: '0.3.21.8'
    },
    owner: 'system',
    model: {
      // Model base properties
      uuid: routeId,
      name: options?.title || `Route: ${pattern}`,
      // Route-specific properties
      pattern,
      viewTag,
      title: options?.title || viewTag,
      serverRoute: options?.serverRoute || false,
      currentPath: '',
      params: {},
      query: {},
      isActive: false,
      viewProps: options?.viewProps || {}
    }
  };
}

