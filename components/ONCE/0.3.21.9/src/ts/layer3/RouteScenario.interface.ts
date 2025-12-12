/**
 * RouteScenario - Web4 Scenario for SPA Routes
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * ✅ Web4 Principle 26: No Factory Functions
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
 */
export interface RouteScenario extends Scenario<RouteModel> {
  // Inherits ior, owner, model from Scenario<RouteModel>
}

