/**
 * PlatformDetection - Runtime platform detection utility
 * Replaces Once.isNode dependency for standalone filesystem component
 */

/**
 * Check if running in Node.js environment
 */
export const isNode: boolean = typeof process !== 'undefined' &&
    process.versions !== undefined &&
    process.versions.node !== undefined;
