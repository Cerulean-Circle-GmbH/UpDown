/**
 * RouteConfig - Route configuration for UcpRouter
 * 
 * ✅ Web4 Principle 19: One File One Type
 * 
 * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
 */

import type { TemplateResult } from 'lit';
import type { RouteParams } from './RouteParams.interface.js';

/**
 * Route configuration
 */
export interface RouteConfig {
  /** URL pattern with optional dynamic segments like :id */
  pattern: string;
  
  /** View tag name to create (e.g., 'once-over-view') */
  viewTag: string;
  
  /** Page title for this route */
  title?: string;
  
  /** Should server be notified of this route? */
  serverRoute?: boolean;
  
  /** Model properties to pass to view */
  modelProps?: Record<string, any>;
}

