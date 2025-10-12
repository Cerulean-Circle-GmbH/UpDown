import { Scenario } from './Scenario.js';
import { Card } from './Card.js';

export type GamePhase = 'ready' | 'playing' | 'game_over';
export type PlayerGuess = 'up' | 'down' | 'equal';

// src/shared/GameModel.ts
export class GameModel {
  deck: Card[];
  currentCard: Card | null;
  previousCard: Card | null;
  round: number;
  score: number;
  streak: number;
  maxStreak: number;
  phase: GamePhase;
  gameOver: boolean;
  lastResult: 'correct' | 'wrong' | null;
  
  constructor() {
    this.deck = [];
    this.currentCard = null;
    this.previousCard = null;
    this.round = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.phase = 'ready';
    this.gameOver = false;
    this.lastResult = null;
  }
  
  startNewGame(): void {
    this.deck = Card.shuffle(Card.createDeck());
    this.currentCard = this.deck.pop() || null;
    this.previousCard = null;
    this.round = 1;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.phase = 'playing';
    this.gameOver = false;
    this.lastResult = null;
  }
  
  makeGuess(guess: PlayerGuess): { correct: boolean; nextCard: Card | null } {
    if (!this.currentCard || this.deck.length === 0) {
      this.phase = 'game_over';
      this.gameOver = true;
      return { correct: false, nextCard: null };
    }
    
    const nextCard = this.deck.pop() || null;
    if (!nextCard) {
      this.phase = 'game_over';
      this.gameOver = true;
      return { correct: false, nextCard: null };
    }
    
    let correct = false;
    
    if (guess === 'up') {
      correct = nextCard.value > this.currentCard.value;
    } else if (guess === 'down') {
      correct = nextCard.value < this.currentCard.value;
    } else if (guess === 'equal') {
      correct = nextCard.value === this.currentCard.value;
    }
    
    this.previousCard = this.currentCard;
    this.currentCard = nextCard;
    this.round++;
    
    if (correct) {
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      
      // Base points + streak bonus
      let points = 10;
      if (guess === 'equal') points = 50; // Equal is harder
      
      // Streak multiplier every 5 correct guesses
      const streakMultiplier = Math.floor(this.streak / 5) + 1;
      points *= streakMultiplier;
      
      this.score += points;
      this.lastResult = 'correct';
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 5); // Lose 5 points but not below 0
      this.lastResult = 'wrong';
      this.phase = 'game_over';
      this.gameOver = true;
    }
    
    return { correct, nextCard };
  }
  
  initFromScenario(scenario: Scenario): void {
    Object.assign(this, scenario.state);
  }
  
  serializeScenario(): string {
    return JSON.stringify({ class: 'GameModel', state: this });
  }
  
  static deserializeScenario(scenario: string): GameModel {
    const obj = JSON.parse(scenario);
    const instance = new GameModel();
    instance.initFromScenario(obj);
    return instance;
  }
}
