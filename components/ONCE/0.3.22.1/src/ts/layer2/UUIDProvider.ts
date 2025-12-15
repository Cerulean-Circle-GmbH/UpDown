/**
 * UUIDProvider.ts
 * Web4 Principle 20: Radical OOP ID Generation
 * 
 * UUID implementation of IDProvider interface.
 * Uses Web Crypto API crypto.randomUUID() for RFC 4122 v4 UUIDs.
 * Works in both browser and Node.js environments.
 * 
 * Example:
 *   const provider = new UUIDProvider();
 *   const id = provider.create(); // "550e8400-e29b-41d4-a716-446655440000"
 *   provider.validate(id); // true
 */

import { IDProvider } from '../layer3/IDProvider.interface.js';

export class UUIDProvider implements IDProvider {
    /**
     * Create a new RFC 4122 v4 UUID
     * Uses Web Crypto API crypto.randomUUID() for cryptographically strong random values.
     * Available in all modern browsers and Node.js 19+.
     * @returns A UUID string in format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     */
    public create(): string {
        // Web Crypto API - works in browser and Node.js
        return crypto.randomUUID();
    }

    /**
     * Validate a UUID string (RFC 4122 v4)
     * @param id - The UUID string to validate
     * @returns True if valid UUID v4 format, false otherwise
     */
    public validate(id: string): boolean {
        // RFC 4122 v4 UUID regex:
        // - 8 hex digits
        // - 4 hex digits
        // - 4 hex digits starting with '4' (version 4)
        // - 4 hex digits starting with '8', '9', 'a', or 'b' (variant 1)
        // - 12 hex digits
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
    }
}

