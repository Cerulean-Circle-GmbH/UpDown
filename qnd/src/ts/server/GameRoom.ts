/**
 * GameRoom — Multiplayer game room with WebSocket protocol
 * QnD Sprint 3: Quick and dirty, web2, working multiplayer
 */

import { WebSocket } from 'ws';
import crypto from 'node:crypto';
import { SPECIAL_CARDS, resolveSpecialCards, type PlayedSpecialCard, type EffectResult } from './SpecialCards.js';

// Card suits and values for French deck
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export interface Card {
  suit: typeof SUITS[number];
  value: typeof VALUES[number];
  numericValue: number;
}

export interface RoomPlayer {
  id: string;
  ws: WebSocket;
  name: string;
  avatarUrl: string;
  score: number;
  streak: number;
  alive: boolean;
  currentGuess: 'up' | 'down' | 'equal' | null;
  specialCard: string | null;
  specialCardTarget: string | null;
  inventory: string[];
  usedSpecials: string[];
  frozen: boolean;
  roundsPlayed: number;
  disconnected: boolean;
}

export type RoomState = 'waiting' | 'countdown' | 'revealing' | 'exchange' | 'finished';

export interface GameRoomInfo {
  id: string;
  name: string;
  hostId: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  state: RoomState;
  round: number;
}

export class GameRoom {
  id: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  isPrivate: boolean;
  roomKey: string | null;
  state: RoomState = 'waiting';
  round: number = 0;

  players: Map<string, RoomPlayer> = new Map();

  // GM state
  private deck: Card[] = [];
  private gmHand: Card[] = [];
  currentCard: Card | null = null;
  previousCard: Card | null = null;
  countdownTimer: NodeJS.Timeout | null = null;
  private countdownSeconds: number = 0;

  constructor(name: string, hostId: string, maxPlayers: number = 10, roomKey: string | null = null) {
    this.id = crypto.randomUUID().slice(0, 8);
    this.name = name;
    this.hostId = hostId;
    this.maxPlayers = maxPlayers;
    this.isPrivate = roomKey !== null;
    this.roomKey = roomKey;
  }

  addPlayer(id: string, ws: WebSocket, name: string, avatarUrl: string): boolean {
    if (this.players.size >= this.maxPlayers) return false;
    if (this.state !== 'waiting' && this.state !== 'exchange') return false;

    this.players.set(id, {
      id, ws, name, avatarUrl,
      score: 0, streak: 0, alive: true,
      currentGuess: null, specialCard: null, specialCardTarget: null,
      inventory: this.generateStarterInventory(), usedSpecials: [], frozen: false,
      roundsPlayed: 0, disconnected: false
    });

    this.broadcast({ type: 'PLAYER_JOINED', player: this.playerInfo(id), playerCount: this.players.size });
    this.sendTo(id, { type: 'ROOM_JOINED', room: this.info(), players: this.allPlayerInfo() });
    return true;
  }

  removePlayer(id: string): void {
    // BUG-1 fix: during active round, mark disconnected instead of removing
    if (this.state === 'countdown' || this.state === 'revealing') {
      const player = this.players.get(id);
      if (player) {
        player.disconnected = true;
        player.alive = false;
      }
      this.broadcast({ type: 'PLAYER_DISCONNECTED', playerId: id });
      return;
    }

    this.players.delete(id);
    this.broadcast({ type: 'PLAYER_LEFT', playerId: id, playerCount: this.players.size });

    if (id === this.hostId && this.players.size > 0) {
      const active = [...this.players.values()].find(p => !p.disconnected);
      this.hostId = active?.id || this.players.keys().next().value!;
      this.broadcast({ type: 'HOST_CHANGED', hostId: this.hostId });
    }
  }

  private cleanupDisconnected(): void {
    for (const [id, player] of this.players) {
      if (player.disconnected) this.players.delete(id);
    }
  }

  startGame(): void {
    if (this.players.size < 1) return;
    this.deck = this.createShuffledDeck();
    this.gmHand = [];
    for (let i = 0; i < 7 && this.deck.length > 0; i++) {
      this.gmHand.push(this.deck.pop()!);
    }
    this.round = 0;
    this.currentCard = null;
    this.previousCard = null;

    this.players.forEach(p => {
      p.score = 0; p.streak = 0; p.alive = true;
      p.currentGuess = null; p.roundsPlayed = 0;
    });

    this.state = 'countdown';
    this.nextRound();
  }

  private nextRound(): void {
    if (this.gmHand.length === 0 && this.deck.length === 0) {
      this.endGame();
      return;
    }

    const alivePlayers = [...this.players.values()].filter(p => p.alive);
    if (alivePlayers.length === 0) {
      this.endGame();
      return;
    }

    this.round++;

    // GM plays a random card from hand
    this.previousCard = this.currentCard;
    const cardIndex = Math.floor(Math.random() * this.gmHand.length);
    this.currentCard = this.gmHand.splice(cardIndex, 1)[0];

    // Refill GM hand from deck
    if (this.deck.length > 0) {
      this.gmHand.push(this.deck.pop()!);
    }

    // Reset player guesses
    this.players.forEach(p => { p.currentGuess = null; p.specialCard = null; });

    this.state = 'countdown';
    this.countdownSeconds = 10;

    // Send ROUND_START per-player (each gets their own inventory)
    this.players.forEach(player => {
      this.sendTo(player.id, {
        type: 'ROUND_START',
        round: this.round,
        currentCard: this.currentCard,
        previousCard: this.previousCard,
        countdown: this.countdownSeconds,
        cardsLeft: this.deck.length + this.gmHand.length,
        alivePlayers: alivePlayers.map(p => p.id),
        inventory: player.inventory,
        frozen: player.frozen
      });
    });

    this.startCountdown();
  }

  private startCountdown(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      this.broadcast({ type: 'COUNTDOWN', seconds: this.countdownSeconds });

      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer!);
        this.countdownTimer = null;
        this.resolveRound();
      }
    }, 1000);
  }

  playSpecialCard(playerId: string, cardId: string, targetPlayerId?: string): void {
    const player = this.players.get(playerId);
    if (!player || !player.alive || this.state !== 'countdown') return;
    if (!player.inventory.includes(cardId)) return;
    if (player.usedSpecials.includes(cardId)) return;

    player.specialCard = cardId;
    player.specialCardTarget = targetPlayerId || null;
    player.inventory = player.inventory.filter(c => c !== cardId);
    player.usedSpecials.push(cardId);

    const card = SPECIAL_CARDS.find(c => c.id === cardId);
    this.broadcast({ type: 'SPECIAL_CARD_PLAYED', playerId, cardName: card?.name, cardEmoji: card?.emoji });
  }

  private generateStarterInventory(): string[] {
    // Always include Protective Shell so specials are testable from round 1
    const guaranteed = ['protective_shell'];
    const l1 = SPECIAL_CARDS.filter(c => c.level === 1 && c.id !== 'protective_shell');
    const l2 = SPECIAL_CARDS.filter(c => c.level === 2);
    const pick = (arr: typeof SPECIAL_CARDS, n: number) => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n).map(c => c.id);
    };
    return [...guaranteed, ...pick(l1, 1), ...pick(l2, 1)];
  }

  playCard(playerId: string, guess: 'up' | 'down' | 'equal'): void {
    const player = this.players.get(playerId);
    if (!player || !player.alive || this.state !== 'countdown') return;
    if (player.frozen) { player.frozen = false; return; }
    player.currentGuess = guess;

    this.broadcast({ type: 'CARD_PLAYED', playerId, hasPlayed: true });

    // Check if all alive, connected players have played
    const alivePlayers = [...this.players.values()].filter(p => p.alive && !p.disconnected);
    const allPlayed = alivePlayers.every(p => p.currentGuess !== null);
    if (allPlayed) {
      if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
      this.resolveRound();
    }
  }

  private resolveRound(): void {
    this.state = 'revealing';

    // GM plays next card
    if (this.gmHand.length === 0 && this.deck.length === 0) {
      this.endGame();
      return;
    }

    this.previousCard = this.currentCard;
    const cardIndex = Math.floor(Math.random() * this.gmHand.length);
    const nextCard = this.gmHand.splice(cardIndex, 1)[0];

    // Refill GM hand
    if (this.deck.length > 0) {
      this.gmHand.push(this.deck.pop()!);
    }

    // Phase 1: Compute base results
    const baseResults = new Map<string, { correct: boolean; alive: boolean; score: number }>();

    this.players.forEach(player => {
      if (!player.alive) return;

      let correct = false;
      if (player.currentGuess === null) {
        correct = false;
      } else if (this.currentCard && nextCard) {
        switch (player.currentGuess) {
          case 'up': correct = nextCard.numericValue > this.currentCard.numericValue; break;
          case 'down': correct = nextCard.numericValue < this.currentCard.numericValue; break;
          case 'equal': correct = nextCard.numericValue === this.currentCard.numericValue; break;
        }
      }

      const roundScore = correct ? 10 + player.streak : 0;
      baseResults.set(player.id, {
        correct,
        alive: correct,
        score: roundScore
      });
    });

    // Phase 2: Resolve special cards (priority: L3 > L2 > L1)
    const playedSpecials: PlayedSpecialCard[] = [];
    this.players.forEach(player => {
      if (player.specialCard) {
        playedSpecials.push({ cardId: player.specialCard, playerId: player.id, targetPlayerId: player.specialCardTarget || undefined });
      }
    });

    const totalAlive = [...this.players.values()].filter(p => p.alive).length;
    const specialEffects = resolveSpecialCards(playedSpecials, baseResults, this.gmHand, totalAlive);

    // Phase 3: Apply results to players
    const results: any[] = [];

    this.players.forEach(player => {
      if (!baseResults.has(player.id)) return;
      const res = baseResults.get(player.id)!;

      const roundScore = res.score;
      player.score += roundScore;
      if (res.correct && res.alive) {
        player.streak++;
      } else {
        player.streak = 0;
      }
      player.alive = res.alive;
      player.roundsPlayed++;

      results.push({
        playerId: player.id,
        name: player.name,
        guess: player.currentGuess,
        correct: res.correct,
        eliminated: !player.alive,
        score: player.score,
        streak: player.streak,
        roundScore
      });
    });

    this.currentCard = nextCard;

    this.broadcast({
      type: 'ROUND_RESULT',
      round: this.round,
      revealedCard: nextCard,
      previousCard: this.previousCard,
      results,
      specialEffects,
      scores: this.allScores(),
      cardsLeft: this.deck.length + this.gmHand.length
    });

    // Check game end
    const alivePlayers = [...this.players.values()].filter(p => p.alive);
    if (alivePlayers.length === 0 || (this.gmHand.length === 0 && this.deck.length === 0)) {
      setTimeout(() => this.endGame(), 2000);
    } else {
      // Exchange phase: cleanup disconnected, then next round
      this.state = 'exchange';
      setTimeout(() => {
        this.cleanupDisconnected();
        this.state = 'countdown';
        this.nextRound();
      }, 3000);
    }
  }

  private endGame(): void {
    this.state = 'finished';
    if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }

    const leaderboard = [...this.players.values()]
      .sort((a, b) => b.score - a.score || b.roundsPlayed - a.roundsPlayed)
      .map((p, i) => {
        // Diamond rewards: 1st=50, 2nd=30, 3rd=20, rest=5 per round survived
        const rankDiamonds = i === 0 ? 50 : i === 1 ? 30 : i === 2 ? 20 : 0;
        const roundDiamonds = p.roundsPlayed * 5;
        const streakBonus = p.streak >= 10 ? 25 : p.streak >= 5 ? 10 : 0;
        const diamonds = rankDiamonds + roundDiamonds + streakBonus;
        return {
          rank: i + 1, playerId: p.id, name: p.name,
          score: p.score, rounds: p.roundsPlayed,
          maxStreak: p.streak, diamonds
        };
      });

    this.broadcast({ type: 'GAME_OVER', leaderboard });
  }

  // Helpers

  private createShuffledDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (let i = 0; i < VALUES.length; i++) {
        deck.push({ suit, value: VALUES[i], numericValue: i + 2 });
      }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  info(): GameRoomInfo {
    return {
      id: this.id, name: this.name, hostId: this.hostId,
      playerCount: this.players.size, maxPlayers: this.maxPlayers,
      isPrivate: this.isPrivate, state: this.state, round: this.round
    };
  }

  private playerInfo(id: string) {
    const p = this.players.get(id);
    if (!p) return null;
    return { id: p.id, name: p.name, avatarUrl: p.avatarUrl, score: p.score, alive: p.alive };
  }

  private allPlayerInfo() {
    return [...this.players.values()].map(p => ({
      id: p.id, name: p.name, avatarUrl: p.avatarUrl, score: p.score, alive: p.alive
    }));
  }

  private allScores() {
    return [...this.players.values()].map(p => ({
      id: p.id, name: p.name, score: p.score, streak: p.streak, alive: p.alive
    }));
  }

  broadcast(msg: object): void {
    const data = JSON.stringify(msg);
    this.players.forEach(p => {
      if (p.ws.readyState === WebSocket.OPEN) p.ws.send(data);
    });
  }

  sendTo(playerId: string, msg: object): void {
    const p = this.players.get(playerId);
    if (p && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(JSON.stringify(msg));
    }
  }
}

/**
 * RoomManager — Manages all game rooms
 */
export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();

  createRoom(name: string, hostId: string, maxPlayers?: number, roomKey?: string | null): GameRoom {
    const room = new GameRoom(name, hostId, maxPlayers, roomKey ?? null);
    this.rooms.set(room.id, room);
    return room;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room?.countdownTimer) clearInterval(room.countdownTimer as any);
    this.rooms.delete(roomId);
  }

  listRooms(): GameRoomInfo[] {
    return [...this.rooms.values()]
      .filter(r => !r.isPrivate)
      .map(r => r.info());
  }

  findPlayerRoom(playerId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) return room;
    }
    return undefined;
  }

  cleanupEmptyRooms(): void {
    for (const [id, room] of this.rooms) {
      if (room.players.size === 0) this.removeRoom(id);
    }
  }
}
