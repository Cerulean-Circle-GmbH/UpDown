/**
 * ComponentConstructor.type.ts - Type for UcpComponent class constructors
 */

import { UcpComponent } from '@web4x/ucp/dist/ts/layer2/UcpComponent.js';
import type { Model } from './Model.interface.js';

/**
 * ComponentConstructor - Type for UcpComponent class constructors
 */
export type ComponentConstructor<TModel extends Model = Model> =
  new () => UcpComponent<TModel>;
