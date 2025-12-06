/**
 * RouteParams - Parameters passed to route view factory
 * 
 * ✅ Web4 Principle 19: One File One Type
 * 
 * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
 */

/**
 * Parameters passed to route view factory
 */
export interface RouteParams {
  /** Current URL path */
  path: string;
  /** Extracted URL parameters (from :segments like /peer/:uuid) */
  params: Record<string, string>;
  /** Query string parameters */
  query: URLSearchParams;
}

