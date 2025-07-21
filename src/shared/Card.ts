import { Scenario, Model } from './Scenario';

export class Card {
  // Example attributes: suit, value, type, owner, etc.
  constructor() {
    // Set up default state here
  }
  initFromScenario(scenario: Scenario): void {
    Object.assign(this, scenario.state);
  }
  serializeScenario(): string {
    return JSON.stringify({ class: 'Card', state: this });
  }
  static deserializeScenario(scenario: string): Card {
    const obj = JSON.parse(scenario);
    const instance = new Card();
    instance.initFromScenario(obj);
    return instance;
  }
}
