/**
 * IDProvider.interface.ts
 * Web4 Principle 20: Radical OOP ID Generation
 * 
 * Interface for generating and validating unique identifiers.
 * Replaces functional uuidv4() calls with object-oriented pattern.
 * 
 * Benefits:
 * - Testable (can inject mock providers)
 * - Replaceable (UUID → ULID → custom)
 * - Radical OOP (no functional calls)
 * - Centralized (one place to change strategy)
 */

export interface IDProvider {
    /**
     * Create a new unique identifier
     * @returns A unique identifier string
     */
    create(): string;

    /**
     * Validate an identifier string
     * @param id - The identifier to validate
     * @returns True if valid, false otherwise
     */
    validate(id: string): boolean;
}

