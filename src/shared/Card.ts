import { Scenario, Model } from './Scenario.js';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=J, 12=Q, 13=K, 14=A

export class Card {
  suit: Suit;
  value: CardValue;
  
  constructor(suit: Suit = '♠', value: CardValue = 2) {
    this.suit = suit;
    this.value = value;
  }
  
  getDisplayValue(): string {
    switch (this.value) {
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      case 14: return 'A';
      default: return this.value.toString();
    }
  }
  
  getColor(): 'red' | 'black' {
    return (this.suit === '♥' || this.suit === '♦') ? 'red' : 'black';
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
  
  static createDeck(): Card[] {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const values: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const deck: Card[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        deck.push(new Card(suit, value));
      }
    }
    
    return deck;
  }
  
  static shuffle(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
