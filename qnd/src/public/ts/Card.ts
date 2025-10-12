/**
 * Card class - Represents a playing card
 */

export type Suit = '♠' | '♥' | '♦' | '♣';
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export class Card {
  constructor(
    public readonly suit: Suit,
    public readonly value: CardValue
  ) {}

  /**
   * Get display value (J, Q, K, A or number)
   */
  getDisplayValue(): string {
    switch (this.value) {
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      case 14: return 'A';
      default: return this.value.toString();
    }
  }

  /**
   * Get card color based on suit
   */
  getColor(): 'red' | 'black' {
    return (this.suit === '♥' || this.suit === '♦') ? 'red' : 'black';
  }

  /**
   * Create a full 52-card deck
   */
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

  /**
   * Shuffle a deck using Fisher-Yates algorithm
   */
  static shuffle(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

