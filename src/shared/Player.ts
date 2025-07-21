// src/shared/Player.ts
export class Player {
  // Example attributes: id, name, score, hand, etc.
  // Always use a parameterless constructor for scenario sync
  constructor() {
    // Set up default state here
  }
  initFromScenario(scenario: Scenario): void {
    Object.assign(this, scenario.state);
  }
  serializeScenario(): string {
    return JSON.stringify({ class: 'Player', state: this });
  }
  static deserializeScenario(scenario: string): Player {
    const obj = JSON.parse(scenario);
    const instance = new Player();
    instance.initFromScenario(obj);
    return instance;
  }
}

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

export type Scenario = {
  class: string;
  state: any;
};
