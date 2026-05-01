/**
 * ONCE v0.3.21.6 - Object Network Communication Engine
 * 
 * ⚠️ DEPRECATED: This file now re-exports from layer1/ONCE.ts
 * 
 * New code should import from:
 * - import { ONCE } from '@web4x/once'; (main entry point)
 * - import type { ONCEKernel } from '@web4x/once/layer3/ONCE.interface';
 * 
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

// Re-export from Layer 1 (universal entry point)
export { ONCE } from '../layer1/ONCE.js';

// Re-export types for backward compatibility
export type { ONCEKernel } from './ONCE.interface.js';
export type { EnvironmentInfo } from './EnvironmentInfo.interface.js';
export type { ComponentQuery } from './ComponentQuery.interface.js';
export type { PerformanceMetrics } from './PerformanceMetrics.interface.js';

