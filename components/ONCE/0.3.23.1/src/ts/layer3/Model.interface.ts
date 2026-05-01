/**
 * Model.interface.ts - Local interface matching @web4x/ucp Model
 * Declared locally to avoid type identity issues with npm exports subpath
 */
export interface Model {
  uuid: string;
  name: string;
  iorComponent?: string;
  iorVersion?: string;
}
