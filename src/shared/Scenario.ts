export type Model = Record<string, unknown>;

export type Scenario = {
  class: string;
  state: Model;
};