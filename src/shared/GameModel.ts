// src/shared/GameModel.ts
export class GameModel {
  // Add model attributes here
  // Example: round: number; cards: Card[]; etc.
  // Always use a parameterless constructor for scenario sync
  constructor() {
    // Set up default state here
  }
  initFromScenario(scenario: Scenario): void {
    // TODO: Inject decrypted state JSON into this instance
    Object.assign(this, scenario.state);
  }
  serializeScenario(): string {
    // TODO: Serialize class reference and encrypted state JSON
    return JSON.stringify({ class: 'GameModel', state: this });
  }
  static deserializeScenario(scenario: string): GameModel {
    // TODO: Decrypt and parse state JSON, then inject into new instance
    const obj = JSON.parse(scenario);
    return new GameModel(obj.state);
  }
}

export type Scenario = {
  class: string;
  state: any;
};

// Add similar stubs for Player, Lobby, Card, etc. as needed
