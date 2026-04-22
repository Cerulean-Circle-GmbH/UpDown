/**
 * EnvironmentModel Interface - JavaBean-style contract with TypeScript accessors
 */

import { EnvironmentScenario } from './EnvironmentScenario.interface.js';

export interface EnvironmentModel {
  hostname: string;
  fqdn: string;
  primaryIP: string;
  domain: string;

  toScenario(): EnvironmentScenario;
  init(scenario?: EnvironmentScenario): this;
}
