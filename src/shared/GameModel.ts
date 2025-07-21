import { Scenario } from './Scenario';

// src/shared/GameModel.ts
export class GameModel {
  // Add model attributes here
  // Example: round: number; cards: Card[]; etc.
  // Always use a parameterless constructor for scenario sync
  constructor() {
    // Set up default state here
  }
  initFromScenario(scenario: Scenario): void {
    Object.assign(this, scenario.state);
  }
  serializeScenario(): string {
    return JSON.stringify({ class: 'GameModel', state: this });
  }
  static deserializeScenario(scenario: string): GameModel {
    const obj = JSON.parse(scenario);
    const instance = new GameModel();
    instance.initFromScenario(obj);
    return instance;
  }
}
