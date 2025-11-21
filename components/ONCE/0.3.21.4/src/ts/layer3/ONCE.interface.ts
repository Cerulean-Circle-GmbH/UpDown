/**
 * ONCE - ONCE Component Interface
 * Web4 pattern: Component interface definition
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md - Updated for Layer 3 split
 */

import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';
import { ONCEDomain } from './ONCEDomain.interface.js';

/**
 * ONCE Component interface - combines domain interface with CLI methods
 */
export interface ONCE extends ONCEDomain {
  info(topic?: string): Promise<this>;
  test(scope?: string, ...references: string[]): Promise<this>;
  build(): Promise<this>;
  clean(): Promise<this>;
  tree(depth?: string, showHidden?: string): Promise<this>;
  links(action?: string): Promise<this>;
}
