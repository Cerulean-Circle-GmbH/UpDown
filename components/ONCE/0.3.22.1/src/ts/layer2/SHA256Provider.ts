/**
 * SHA256Provider.ts - SHA-256 Content ID Provider
 * 
 * Implements ContentIDProvider using SHA-256 hash (like git).
 * Creates deterministic 64-character hex IDs from content.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (object-oriented hash generation)
 * - P6: Empty constructor, init() pattern
 * 
 * @ior ior:esm:/ONCE/{version}/SHA256Provider
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { ContentIDProvider } from '../layer3/ContentIDProvider.interface.js';
import { Reference } from '../layer3/Reference.interface.js';

/**
 * SHA256Provider - SHA-256 content hashing (like git)
 * 
 * Usage:
 * ```typescript
 * const provider = new SHA256Provider();
 * const hash = await provider.contentIdCreate(fileContent);
 * // "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
 * ```
 */
export class SHA256Provider implements ContentIDProvider {
  
  /** Algorithm name */
  readonly algorithm = 'SHA-256';
  
  /** SHA-256 produces 64 hex characters (256 bits / 4 bits per hex) */
  readonly hashLength = 64;
  
  /**
   * Create a random UUID (implements IDProvider.create)
   * 
   * Note: For IDProvider interface compatibility.
   * For content-based IDs, use contentIdCreate().
   */
  create(): string {
    return crypto.randomUUID();
  }
  
  /**
   * Validate a SHA-256 hash string
   * 
   * @param id Hash string to validate
   * @returns true if valid 64-char hex string
   */
  validate(id: string): boolean {
    const sha256Regex = /^[0-9a-f]{64}$/i;
    return sha256Regex.test(id);
  }
  
  /**
   * Create SHA-256 hash from content (async)
   * 
   * Uses Web Crypto API (available in browser and Node.js 15+).
   * 
   * @param content Content to hash
   * @returns 64-character hex hash string
   */
  async contentIdCreate(content: ArrayBuffer | string | Uint8Array): Promise<string> {
    // Convert to Uint8Array (works with crypto.subtle.digest)
    let data: Uint8Array;
    
    if (typeof content === 'string') {
      data = new TextEncoder().encode(content);
    } else if (content instanceof Uint8Array) {
      data = content;
    } else {
      data = new Uint8Array(content);
    }
    
    // Compute SHA-256 (cast to BufferSource for strict TypeScript)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
    
    // Convert to hex string - P4a: Use for...of instead of map with arrow
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexParts: string[] = [];
    for (const b of hashArray) {
      hexParts.push(b.toString(16).padStart(2, '0'));
    }
    return hexParts.join('');
  }
  
  /**
   * Create SHA-256 hash synchronously
   * 
   * Note: Browser crypto.subtle only supports async.
   * Returns null in browser environment.
   * 
   * @param content Content to hash
   * @returns Hash string or null if sync not available
   */
  contentIdCreateSync(content: ArrayBuffer | string | Uint8Array): Reference<string> {
    // Check if Node.js crypto is available
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        // Dynamic import would be async, so we use require pattern
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const nodeCrypto = require('node:crypto');
        const hash = nodeCrypto.createHash('sha256');
        
        if (typeof content === 'string') {
          hash.update(content, 'utf8');
        } else if (content instanceof Uint8Array) {
          hash.update(content);
        } else {
          hash.update(new Uint8Array(content));
        }
        
        return hash.digest('hex');
      } catch {
        return null;
      }
    }
    
    // Browser environment - sync not available
    return null;
  }
}

/**
 * Singleton instance for convenience
 */
export const sha256Provider = new SHA256Provider();






