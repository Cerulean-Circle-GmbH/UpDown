/**
 * ComponentConstructor.type.ts - Type for UcpComponent class constructors
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/ComponentConstructor
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { UcpComponent } from '../layer2/UcpComponent.js';
import type { Model } from './Model.interface.js';

/**
 * ComponentConstructor - Type for UcpComponent class constructors
 */
export type ComponentConstructor<TModel extends Model = Model> = 
  new () => UcpComponent<TModel>;


