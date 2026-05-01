/**
 * BotPlayer — AI agent for UpDown card game
 * Pure card-counting heuristic, no LLM, zero external deps
 * QnD Sprint 3 Task 14
 */

import type { Card } from './GameRoom.js';

export type BotPersonality = 'cautious' | 'gambler' | 'equal-lover' | 'random';

const BOT_NAMES: Record<BotPersonality, string[]> = {
  cautious: ['🤖 Sage', '🤖 Owl', '🤖 Monk'],
  gambler: ['🎰 Lucky', '🎰 Dice', '🎰 Blitz'],
  'equal-lover': ['⚖️ Balance', '⚖️ Zen', '⚖️ Mirror'],
  random: ['🎲 Chaos', '🎲 Wildcard', '🎲 Fizz'],
};

export class BotPlayer {
  personality: BotPersonality;
  name: string;
  private playedCards: Card[] = [];

  constructor(personality?: BotPersonality) {
    this.personality = personality || this.randomPersonality();
    const names = BOT_NAMES[this.personality];
    this.name = names[Math.floor(Math.random() * names.length)];
  }

  private randomPersonality(): BotPersonality {
    const all: BotPersonality[] = ['cautious', 'gambler', 'equal-lover', 'random'];
    return all[Math.floor(Math.random() * all.length)];
  }

  trackCard(card: Card): void {
    this.playedCards.push(card);
  }

  reset(): void {
    this.playedCards = [];
  }

  decideGuess(currentCard: Card): 'up' | 'down' | 'equal' {
    if (this.personality === 'random') {
      const choices: ('up' | 'down' | 'equal')[] = ['up', 'down', 'equal'];
      return choices[Math.floor(Math.random() * 3)];
    }

    // Count remaining cards by comparing to what's been played
    const totalInDeck = 52;
    const remaining = totalInDeck - this.playedCards.length - 1; // -1 for current card
    if (remaining <= 0) return 'equal';

    // Count remaining cards above/below/equal to current value
    // Full deck: 4 cards per value (2-14), 13 values
    const countByValue = new Array(15).fill(4); // index 2-14, each starts at 4
    countByValue[0] = 0; countByValue[1] = 0; // unused indices

    // Subtract played cards
    for (const card of this.playedCards) {
      countByValue[card.numericValue]--;
    }
    // Subtract current card
    countByValue[currentCard.numericValue]--;

    let above = 0, below = 0, equal = 0;
    for (let v = 2; v <= 14; v++) {
      if (countByValue[v] <= 0) continue;
      if (v > currentCard.numericValue) above += countByValue[v];
      else if (v < currentCard.numericValue) below += countByValue[v];
      else equal += countByValue[v];
    }

    const total = above + below + equal;
    if (total === 0) return 'equal';

    let probUp = above / total;
    let probDown = below / total;
    let probEqual = equal / total;

    // Personality modifiers
    if (this.personality === 'equal-lover') {
      probEqual += 0.15;
    }

    // Pick best
    const probs = [
      { guess: 'up' as const, prob: probUp },
      { guess: 'down' as const, prob: probDown },
      { guess: 'equal' as const, prob: probEqual },
    ].sort((a, b) => b.prob - a.prob);

    if (this.personality === 'gambler' && Math.random() < 0.2 && probs.length > 1) {
      return probs[1].guess; // Pick second-best 20% of the time
    }

    return probs[0].guess;
  }

  decideSpecialCard(inventory: string[], alive: boolean): string | null {
    if (inventory.length === 0) return null;

    // Simple rules: play protective_shell if we have it and personality isn't gambler
    if (!alive) return null;

    if (this.personality === 'cautious' && inventory.includes('protective_shell')) {
      return 'protective_shell';
    }
    if (this.personality === 'gambler' && inventory.includes('double_points')) {
      return 'double_points';
    }

    // 30% chance to play a random card
    if (Math.random() < 0.3 && inventory.length > 0) {
      return inventory[Math.floor(Math.random() * inventory.length)];
    }

    return null;
  }
}
