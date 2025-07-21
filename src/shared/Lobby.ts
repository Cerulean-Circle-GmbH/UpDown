import { Scenario, Model } from './Scenario';

export class Lobby {
  // Example attributes: id, host, players, settings, etc.
  constructor() {
    // Set up default state here
  }
  initFromScenario(scenario: Scenario): void {
    Object.assign(this, scenario.state);
  }
  serializeScenario(): string {
    return JSON.stringify({ class: 'Lobby', state: this });
  }
  static deserializeScenario(scenario: string): Lobby {
    const obj = JSON.parse(scenario);
    const instance = new Lobby();
    instance.initFromScenario(obj);
    return instance;
  }
}
