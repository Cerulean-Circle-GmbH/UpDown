import { Scenario, Serializable } from './Scenario.js';
import { Card, CardType } from './Card.js';

export enum PlayerStatus {
  ACTIVE = 'active',
  ELIMINATED = 'eliminated',
  WAITING = 'waiting'
}

export class Player implements Serializable {
  public id: string;
  public name: string;
  public score: number;
  public streak: number; // consecutive correct guesses
  public status: PlayerStatus;
  public hand: Card[]; // cards available to play
  public lastGuess?: CardType;
  public diamonds: number; // in-game currency

  constructor(id?: string, name?: string) {
    this.id = id || this.generateId();
    this.name = name || 'Anonymous';
    this.score = 0;
    this.streak = 0;
    this.status = PlayerStatus.WAITING;
    this.hand = this.createDefaultHand();
    this.diamonds = 0;
  }

  private generateId(): string {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  private createDefaultHand(): Card[] {
    return [
      new Card(undefined, undefined, CardType.UP),
      new Card(undefined, undefined, CardType.DOWN),
      new Card(undefined, undefined, CardType.EVEN)
    ];
  }

  // Play a card from hand
  playCard(cardType: CardType): Card | null {
    const cardIndex = this.hand.findIndex(card => card.type === cardType);
    if (cardIndex === -1) return null;

    const card = this.hand[cardIndex];
    this.lastGuess = cardType;

    // For regular cards, replace with new one after playing
    if (cardType !== CardType.SPECIAL) {
      this.hand[cardIndex] = new Card(undefined, undefined, cardType);
    } else {
      // Special cards are consumed
      this.hand.splice(cardIndex, 1);
    }

    return card;
  }

  // Handle correct guess
  correctGuess(): void {
    this.streak++;
    this.score += this.calculatePoints();
  }

  // Handle incorrect guess
  incorrectGuess(): void {
    this.streak = 0;
    this.status = PlayerStatus.ELIMINATED;
    this.score = Math.max(0, this.score - 10); // lose points but not below 0
  }

  // Calculate points based on streak
  private calculatePoints(): number {
    let basePoints = 10;
    
    // Bonus for streaks
    if (this.streak % 5 === 0 && this.streak > 0) {
      basePoints *= Math.floor(this.streak / 5) + 1;
    }
    
    return basePoints;
  }

  // Add special card to hand
  addSpecialCard(card: Card): void {
    if (card.type === CardType.SPECIAL) {
      this.hand.push(card);
    }
  }

  // Reset for new round
  resetForNewRound(): void {
    this.status = PlayerStatus.ACTIVE;
    this.lastGuess = undefined;
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
