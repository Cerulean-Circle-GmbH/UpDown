/**
 * ContentIDProvider.interface.ts - Content-based ID Generation
 * 
 * Extends IDProvider for content-addressable hashing (like git).
 * Creates deterministic IDs from content (same content = same ID).
 * 
 * Use Cases:
 * - Artefact content hashing (file deduplication)
 * - Git-like object storage
 * - Content-addressable scenarios
 * 
 * Web4 Principles:
 * - P4: Radical OOP (object-oriented ID generation)
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/ContentIDProvider
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { IDProvider } from './IDProvider.interface.js';
import { Reference } from './Reference.interface.js';

/**
 * ContentIDProvider - Content-based unique identifier generation
 * 
 * Unlike IDProvider (random IDs), ContentIDProvider creates
 * deterministic IDs from content. Same content always produces
 * the same ID.
 * 
 * Implementations:
 * - SHA256Provider (like git - 64 hex chars)
 * - MD5Provider (legacy - 32 hex chars)
 * 
 * Usage:
 * ```typescript
 * const provider = component.relatedObjectLookupFirst(ContentIDProvider);
 * const contentId = provider.contentIdCreate(arrayBuffer);
 * // "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
 * ```
 */
export interface ContentIDProvider extends IDProvider {
  
  /**
   * Create ID from content (deterministic)
   * 
   * Same content always produces the same ID.
   * 
   * @param content Content to hash (ArrayBuffer, string, or Uint8Array)
   * @returns Hash string (hex encoded)
   */
  contentIdCreate(content: ArrayBuffer | string | Uint8Array): Promise<string>;
  
  /**
   * Create ID from content synchronously (if possible)
   * 
   * Note: Browser crypto.subtle only supports async.
   * Node.js crypto supports sync. Returns null if sync not available.
   * P5: Use Reference<T> for nullable return
   * 
   * @param content Content to hash
   * @returns Hash string or null if sync not available
   */
  contentIdCreateSync(content: ArrayBuffer | string | Uint8Array): Reference<string>;
  
  /**
   * Get the algorithm name (e.g., "SHA-256", "MD5")
   */
  readonly algorithm: string;
  
  /**
   * Get the expected hash length in hex characters
   */
  readonly hashLength: number;
}



