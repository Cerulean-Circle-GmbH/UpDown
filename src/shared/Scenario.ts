export type Model = Record<string, unknown>;

export type Scenario = {
  class: string;
  state: Model;
};

// Base interface for all serializable game objects
export interface Serializable {
  initFromScenario(scenario: Scenario): void;
  serializeScenario(): string;
}