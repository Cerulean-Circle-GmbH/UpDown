import { MSG } from '../shared/MessageTypes.js';
/**
 * GameRoom — Multiplayer game room with WebSocket protocol
 * QnD Sprint 3: Quick and dirty, web2, working multiplayer
 */

import { WebSocket } from 'ws';
import crypto from 'node:crypto';
import { SPECIAL_CARDS, resolveSpecialCards, type PlayedSpecialCard, type EffectResult } from './SpecialCards.js';
import { BotPlayer, type BotPersonality } from './BotPlayer.js';

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
  private bots: Map<string, BotPlayer> = new Map();
  spectators: Map<string, { id: string; ws: WebSocket; name: string }> = new Map();
  chatHistory: { senderId: string; senderName: string; text: string; timestamp: number }[] = [];

  // GM state
  private deck: Card[] = [];
  private gmHand: Card[] = [];
  currentCard: Card | null = null;
  previousCard: Card | null = null;
  countdownTimer: NodeJS.Timeout | null = null;
  private countdownSeconds: number = 0;
  private lobbyTimer: NodeJS.Timeout | null = null;
  private lobbyCountdown: number = 0;

  minPlayers: number;
  autoStart: boolean;
  autoRecreate: boolean;
  private recreateCallback: (() => void) | null = null;
  private cleanupCallback: (() => void) | null = null;

  constructor(name: string, hostId: string, maxPlayers: number = 10, roomKey: string | null = null, opts?: { minPlayers?: number; autoStart?: boolean; autoRecreate?: boolean; id?: string }) {
    this.id = opts?.id || crypto.randomUUID().slice(0, 8);
    this.name = name;
    this.hostId = hostId;
    this.maxPlayers = maxPlayers;
    this.minPlayers = opts?.minPlayers || 1;
    this.autoStart = opts?.autoStart || false;
    this.autoRecreate = opts?.autoRecreate || false;
    this.isPrivate = roomKey !== null;
    this.roomKey = roomKey;
  }

  setRecreateCallback(cb: () => void): void {
    this.recreateCallback = cb;
  }

  setCleanupCallback(cb: () => void): void {
    this.cleanupCallback = cb;
  }

  // [uc:uuid:9cc60247] UC-R4: room.join — [uc:uuid:d0b57a5a] UC-R7: room.join.full — [uc:uuid:8db2e073] UC-R8: room.join.midGame
  addPlayer(id: string, ws: WebSocket, name: string, avatarUrl: string): boolean {
    if (this.players.size >= this.maxPlayers) return false; // [uc:uuid:d0b57a5a]
    if (this.state !== 'waiting' && this.state !== 'exchange') return false; // [uc:uuid:d466a7f1] UC-R9: room.join.rejected

    this.players.set(id, {
      id, ws, name, avatarUrl,
      score: 0, streak: 0, alive: true,
      currentGuess: null, specialCard: null, specialCardTarget: null,
      inventory: this.generateStarterInventory(), usedSpecials: [], frozen: false,
      roundsPlayed: 0, disconnected: false
    });

    // Transfer host from 'server' to first human
    if (this.hostId === 'server' && !this.bots.has(id)) {
      this.hostId = id;
    }

    this.broadcast({ type: MSG.PLAYER_JOINED, player: this.playerInfo(id), playerCount: this.players.size, minPlayers: this.minPlayers });
    this.sendTo(id, { type: MSG.ROOM_JOINED, room: this.info(), players: this.allPlayerInfo(), minPlayers: this.minPlayers });
    if (this.chatHistory.length > 0) {
      this.sendTo(id, { type: MSG.CHAT_HISTORY, messages: this.chatHistory });
    }

    return true;
  }

  // [uc:uuid:f1ba3e42] UC-B1: bot.add
  addBot(personality?: BotPersonality): string {
    const bot = new BotPlayer(personality);
    const id = `bot-${crypto.randomUUID().slice(0, 6)}`;

    this.players.set(id, {
      id, ws: null as any, name: bot.name, avatarUrl: '',
      score: 0, streak: 0, alive: true,
      currentGuess: null, specialCard: null, specialCardTarget: null,
      inventory: this.generateStarterInventory(), usedSpecials: [], frozen: false,
      roundsPlayed: 0, disconnected: false
    });
    this.bots.set(id, bot);

    this.broadcast({ type: MSG.PLAYER_JOINED, player: this.playerInfo(id), playerCount: this.players.size, minPlayers: this.minPlayers });
    return id;
  }

  // [uc:uuid:ac08aa49] UC-S1: spectator.join
  addSpectator(id: string, ws: WebSocket, name: string): void {
    this.spectators.set(id, { id, ws, name });
    this.sendToSpectator(id, {
      type: MSG.SPECTATE_JOINED,
      room: this.info(),
      players: this.allPlayerInfo(),
      currentCard: this.currentCard,
      previousCard: this.previousCard,
      round: this.round,
      state: this.state
    });
    this.broadcastAll({ type: MSG.SPECTATOR_JOINED, name, spectatorCount: this.spectators.size });
    if (this.chatHistory.length > 0) {
      this.sendToSpectator(id, { type: MSG.CHAT_HISTORY, messages: this.chatHistory });
    }
  }

  // [uc:uuid:d30575e7] UC-S2: spectator.leave
  removeSpectator(id: string): void {
    const spec = this.spectators.get(id);
    this.spectators.delete(id);
    if (spec) this.broadcastAll({ type: MSG.SPECTATOR_LEFT, spectatorCount: this.spectators.size });
  }

  // [uc:uuid:df7ec971] UC-S3: spectator.joinNext
  promoteSpectator(id: string, name: string, avatarUrl: string): boolean {
    const spec = this.spectators.get(id);
    if (!spec || (this.state !== 'waiting' && this.state !== 'exchange')) return false;
    if (this.players.size >= this.maxPlayers) return false;
    this.spectators.delete(id);
    return this.addPlayer(id, spec.ws, name, avatarUrl);
  }

  private sendToSpectator(id: string, msg: object): void {
    const s = this.spectators.get(id);
    if (s && s.ws && s.ws.readyState === WebSocket.OPEN) {
      s.ws.send(JSON.stringify(msg));
    }
  }

  private broadcastAll(msg: object): void {
    const data = JSON.stringify(msg);
    this.players.forEach(p => {
      if (p.ws && p.ws.readyState === WebSocket.OPEN) p.ws.send(data);
    });
    this.spectators.forEach(s => {
      if (s.ws && s.ws.readyState === WebSocket.OPEN) s.ws.send(data);
    });
  }

  private humanCount(): number {
    return [...this.players.values()].filter(p => !this.bots.has(p.id)).length;
  }

  private startLobbyCountdown(): void {
    this.lobbyCountdown = 30;
    this.broadcastAll({ type: MSG.LOBBY_COUNTDOWN, seconds: this.lobbyCountdown, message: 'Game starts in 30s — invite friends!' });

    this.lobbyTimer = setInterval(() => {
      this.lobbyCountdown--;

      if (this.lobbyCountdown <= 0) {
        clearInterval(this.lobbyTimer!);
        this.lobbyTimer = null;
        this.fillBotsAndStart();
        return;
      }

      this.broadcastAll({ type: MSG.LOBBY_COUNTDOWN, seconds: this.lobbyCountdown });
    }, 1000);
  }

  private fillBotsAndStart(): void {
    if (this.state !== 'waiting') return;
    if (this.humanCount() === 0) return;

    // Fill remaining slots with bots
    const needed = this.minPlayers - this.players.size;
    for (let i = 0; i < needed; i++) {
      this.addBot();
    }

    this.broadcast({ type: MSG.BOTS_FILLED, botCount: needed, totalPlayers: this.players.size });
    this.startGame();
  }

  private scheduleBotDecisions(): void {
    if (!this.currentCard) return;

    this.bots.forEach((bot, botId) => {
      const player = this.players.get(botId);
      if (!player || !player.alive || player.frozen) return;

      // Random delay 1-8s for human feel
      const delay = 1000 + Math.floor(Math.random() * 7000);
      setTimeout(() => {
        if (this.state !== 'countdown' || player.currentGuess !== null) return;

        // Play special card FIRST (before guess, since guess can trigger resolveRound)
        const special = bot.decideSpecialCard(player.inventory, player.alive);
        if (special) {
          this.playSpecialCard(botId, special);
        }

        const guess = bot.decideGuess(this.currentCard!);
        this.playCard(botId, guess);
      }, delay);
    });
  }

  // [uc:uuid:96f2ecd5] UC-R10: room.leave — [uc:uuid:e6b4716c] UC-C2: connection.close — [uc:uuid:dd0392cf] UC-H1: host.transfer
  removePlayer(id: string): void {
    // BUG-1 fix: during active round, mark disconnected instead of removing
    if (this.state === 'countdown' || this.state === 'revealing') {
      const player = this.players.get(id);
      if (player) {
        player.disconnected = true;
        player.alive = false;
      }
      this.broadcast({ type: MSG.PLAYER_DISCONNECTED, playerId: id });
      return;
    }

    this.players.delete(id);
    this.bots.delete(id);
    this.broadcast({ type: MSG.PLAYER_LEFT, playerId: id, playerCount: this.players.size });

    // Cancel lobby countdown if no humans left
    if (this.lobbyTimer && this.humanCount() === 0) {
      clearInterval(this.lobbyTimer);
      this.lobbyTimer = null;
      this.broadcastAll({ type: MSG.LOBBY_COUNTDOWN_CANCELLED });
    }

    if (id === this.hostId && this.players.size > 0) {
      const active = [...this.players.values()].find(p => !p.disconnected);
      this.hostId = active?.id || this.players.keys().next().value!;
      this.broadcast({ type: MSG.HOST_CHANGED, hostId: this.hostId });
    }
  }

  private cleanupDisconnected(): void {
    for (const [id, player] of this.players) {
      if (player.disconnected) this.players.delete(id);
    }
  }

  // [uc:uuid:560d9a46] UC-G1: game.start — [uc:uuid:f89b9338] UC-G2: game.start.autoFillBots
  startGame(): void {
    if (this.players.size < 1) return;
    // Fill remaining slots with bots up to minPlayers
    while (this.players.size < this.minPlayers) {
      this.addBot();
    }
    this.deck = this.createShuffledDeck();
    this.gmHand = [];
    for (let i = 0; i < 7 && this.deck.length > 0; i++) {
      this.gmHand.push(this.deck.pop()!);
    }
    this.round = 0;
    this.currentCard = null;
    this.previousCard = null;
    this.bots.forEach(bot => bot.reset());

    this.players.forEach(p => {
      p.score = 0; p.streak = 0; p.alive = true;
      p.currentGuess = null; p.roundsPlayed = 0;
    });

    this.state = 'countdown';
    this.nextRound();
  }

  // [uc:uuid:f8e39106] UC-RD1: round.start — [uc:uuid:7886e805] UC-RD8: round.deckExhausted
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
        type: MSG.ROUND_START,
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

    // Track card for bots and schedule their decisions
    if (this.currentCard) {
      this.bots.forEach(bot => bot.trackCard(this.currentCard!));
    }
    this.scheduleBotDecisions();
  }

  // [uc:uuid:224c5b9e] UC-RD2: round.countdown — [uc:uuid:34620f4b] UC-RD5: round.resolve.timeout
  private startCountdown(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      this.broadcast({ type: MSG.COUNTDOWN, seconds: this.countdownSeconds });

      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer!);
        this.countdownTimer = null;
        this.resolveRound();
      }
    }, 1000);
  }

  // [uc:uuid:f43897d5] UC-P9: player.playSpecial — [uc:uuid:b6862ad2] UC-P10: notInInventory — [uc:uuid:c503e19a] UC-P11: alreadyUsed
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
    this.broadcast({ type: MSG.SPECIAL_CARD_PLAYED, playerId, cardName: card?.name, cardEmoji: card?.emoji });
  }

  // [uc:uuid:dda127ab] UC-SC13: special.inventory
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

  // [uc:uuid:f0295f28] UC-P1: player.guess.up — [uc:uuid:c9866c6e] UC-P2: down — [uc:uuid:fa8f1c83] UC-P3: equal — [uc:uuid:e4b6d041] UC-P7: frozen — [uc:uuid:b3fb6696] UC-RD4: allPlayed
  playCard(playerId: string, guess: 'up' | 'down' | 'equal'): void {
    const player = this.players.get(playerId);
    if (!player || !player.alive || this.state !== 'countdown') return;
    if (player.frozen) { player.frozen = false; return; }
    player.currentGuess = guess;

    this.broadcast({ type: MSG.CARD_PLAYED, playerId, hasPlayed: true });

    // Check if all alive, connected players have played
    const alivePlayers = [...this.players.values()].filter(p => p.alive && !p.disconnected);
    const allPlayed = alivePlayers.every(p => p.currentGuess !== null);
    if (allPlayed) {
      if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
      this.resolveRound();
    }
  }

  // [uc:uuid:e5c73817] UC-RD3: round.resolve — [uc:uuid:035d2535] UC-P4: correct — [uc:uuid:1a56ba00] UC-P5: wrong — [uc:uuid:4af9fb90] UC-RD6: specials — [uc:uuid:76f767e4] UC-RD7: exchange
  private resolveRound(): void {
    // Re-entry guard: prevent double resolution from timer + allPlayed race
    if (this.state !== 'countdown') return;
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
      type: MSG.ROUND_RESULT,
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

  // [uc:uuid:38d62fef] UC-GE1: allEliminated — [uc:uuid:e73e7784] UC-GE2: deckEmpty — [uc:uuid:e4bd6ed5] UC-GE3: leaderboard — [uc:uuid:b1be7a22] UC-GE4: diamonds
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

    this.broadcast({ type: MSG.GAME_OVER, leaderboard, playAgain: true, roomId: this.id });

    // Auto-recreate: instant so room ID is always valid (preset rooms only)
    if (this.autoRecreate) {
      if (this.recreateCallback) this.recreateCallback();
    } else {
      // User-created rooms: auto-remove after 60s ONLY if no players remain
      setTimeout(() => {
        if (this.players.size === 0 && this.spectators.size === 0) {
          if (this.cleanupCallback) this.cleanupCallback();
        }
      }, 60000);
    }
  }

  // [uc:uuid:ea33c5b7] UC-GE5: game.end.playAgain
  resetForReplay(): void {
    if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }

    this.state = 'waiting';
    this.round = 0;
    this.currentCard = null;
    this.previousCard = null;
    this.deck = [];
    this.gmHand = [];

    // Reset players but KEEP them connected
    this.players.forEach(player => {
      player.score = 0;
      player.streak = 0;
      player.alive = true;
      player.currentGuess = null;
      player.specialCard = null;
      player.specialCardTarget = null;
      player.inventory = this.generateStarterInventory();
      player.usedSpecials = [];
      player.frozen = false;
      player.roundsPlayed = 0;
      player.disconnected = false;
    });

    // Keep: bots, chatHistory, hostId, room name/id, spectators
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

  info(): GameRoomInfo & { minPlayers: number; autoStart: boolean; shareUrl: string; spectatorCount: number } {
    return {
      id: this.id, name: this.name, hostId: this.hostId,
      playerCount: this.players.size, maxPlayers: this.maxPlayers,
      isPrivate: this.isPrivate, state: this.state, round: this.round,
      minPlayers: this.minPlayers, autoStart: this.autoStart,
      shareUrl: `/mp?join=${this.id}`,
      spectatorCount: this.spectators.size
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
      if (p.ws && p.ws.readyState === WebSocket.OPEN) p.ws.send(data);
    });
    this.spectators.forEach(s => {
      if (s.ws && s.ws.readyState === WebSocket.OPEN) s.ws.send(data);
    });
  }

  sendTo(playerId: string, msg: object): void {
    const p = this.players.get(playerId);
    if (p && p.ws && p.ws.readyState === WebSocket.OPEN) {
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
    room.setCleanupCallback(() => { this.removeRoom(room.id); });
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

  findSpectatorRoom(spectatorId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.spectators.has(spectatorId)) return room;
    }
    return undefined;
  }

  cleanupEmptyRooms(): void {
    for (const [id, room] of this.rooms) {
      // Don't cleanup preset auto-recreate rooms
      if (room.players.size === 0 && !room.autoRecreate) this.removeRoom(id);
    }
  }

  createPresetRooms(): void {
    const presets = [
      { name: '2 Players', id: '2p', min: 2, max: 2 },
      { name: '3 Players', id: '3p', min: 3, max: 3 },
      { name: '4 Players', id: '4p', min: 4, max: 4 },
      { name: '5 Players', id: '5p', min: 5, max: 5 },
      { name: 'Party (10)', id: 'party', min: 3, max: 10 },
    ];

    for (const p of presets) {
      this.createPresetRoom(p.name, p.id, p.min, p.max);
    }
  }

  private createPresetRoom(name: string, id: string, minPlayers: number, maxPlayers: number): void {
    const room = new GameRoom(name, 'server', maxPlayers, null, {
      id, minPlayers, autoStart: true, autoRecreate: true
    });
    room.setRecreateCallback(() => {
      // Reset room state for next game, keep the room alive
      this.rooms.delete(id);
      this.createPresetRoom(name, id, minPlayers, maxPlayers);
    });
    this.rooms.set(room.id, room);
  }
}
