import { Scenario, Serializable } from './Scenario.js';

export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum CardType {
  UP = 'up',
  DOWN = 'down',
  EVEN = 'even',
  SPECIAL = 'special'
}

export class Card implements Serializable {
  public suit?: Suit;
  public value?: number; // 1-13 for regular cards (1=Ace, 11=Jack, 12=Queen, 13=King)
  public type: CardType;
  public specialEffect?: string;
  public owner?: string;

  constructor(suit?: Suit, value?: number, type: CardType = CardType.UP) {
    this.suit = suit;
    this.value = value;
    this.type = type;
  }

  // Create a standard playing card
  static createPlayingCard(suit: Suit, value: number): Card {
    if (value < 1 || value > 13) {
      throw new Error('Card value must be between 1 and 13');
    }
    const card = new Card(suit, value, CardType.UP);
    return card;
  }

  // Create a special effect card
  static createSpecialCard(effect: string): Card {
    const card = new Card(undefined, undefined, CardType.SPECIAL);
    card.specialEffect = effect;
    return card;
  }

  // Check if this card is higher than another card
  isHigherThan(other: Card): boolean {
    if (!this.value || !other.value) return false;
    return this.value > other.value;
  }

  // Check if this card is lower than another card
  isLowerThan(other: Card): boolean {
    if (!this.value || !other.value) return false;
    return this.value < other.value;
  }

  // Check if this card has the same value as another card
  isEqualTo(other: Card): boolean {
    if (!this.value || !other.value) return false;
    return this.value === other.value;
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
