/**
 * UpDown.CoreModel - UpDown.Core Component Model Interface
 * Web4 pattern: Component model following auto-discovery patterns
 */

import { Model } from './Model.interface.js';

export interface Card {
  suit: string;
  value: number;
  displayName: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  maxStreak: number;
  isActive: boolean;
  hand: {
    upCard: number;
    downCard: number;
    evenCard: number;
    specialCards: any[];
  };
}

export interface GameState {
  phase: 'ready' | 'playing' | 'game_over';
  round: number;
  currentCard: Card | null;
  previousCard: Card | null;
  players: Player[];
  gameMode: 'rapid' | 'multiplayer';
  deck: Card[];
  gameMaster: {
    hand: Card[];
    deck: Card[];
  };
  currentGuesses?: Map<string, 'up' | 'down' | 'even'>;
}

export interface UpDown_CoreModel extends Model {
  uuid: string;
  name: string;
  origin: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
  gameState?: GameState;
}
