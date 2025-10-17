/**
 * GameDemoSystemModel - UpDown.Demo Component Model Interface
 * Web4 pattern: Component model following auto-discovery patterns
 */

import { Model } from './Model.interface.js';

export interface DemoScenario {
  name: string;
  description: string;
  steps: string[];
  expectedOutcome: string;
}

export interface GameDemoSystemModel extends Model {
  uuid: string;
  name: string;
  origin: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
  currentScenario?: DemoScenario;
  demoHistory?: DemoScenario[];
}
