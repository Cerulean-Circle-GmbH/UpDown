/**
 * MultiplayerUI — In-game multiplayer screen
 * QnD Sprint 3: Shows table, players, GM card, countdown, Up/Down/Equal buttons
 */

import { WebSocketClient } from './WebSocketClient.js';

interface PlayerScore {
  id: string; name: string; score: number; streak: number; alive: boolean;
}

interface Card {
  suit: string; value: string; numericValue: number;
}

export class MultiplayerUI {
  private client: WebSocketClient;
  private container: HTMLElement;
  private roomId: string = '';
  private isHost: boolean = false;
  private players: any[] = [];
  private currentCard: Card | null = null;
  private previousCard: Card | null = null;
  private countdown: number = 0;
  private hasPlayed: boolean = false;
  private round: number = 0;
  private inventory: string[] = [];
  private frozen: boolean = false;
  private onLeaveRoom: () => void;

  constructor(client: WebSocketClient, container: HTMLElement, onLeaveRoom: () => void) {
    this.client = client;
    this.container = container;
    this.onLeaveRoom = onLeaveRoom;

    this.client.on('ROOM_JOINED', (msg) => {
      this.roomId = msg.room.id;
      this.isHost = msg.room.hostId === this.client.clientId;
      this.players = msg.players;
      this.render();
    });

    this.client.on('PLAYER_JOINED', (msg) => {
      this.players.push(msg.player);
      this.renderPlayers();
    });

    this.client.on('PLAYER_LEFT', (msg) => {
      this.players = this.players.filter(p => p.id !== msg.playerId);
      this.renderPlayers();
    });

    this.client.on('HOST_CHANGED', (msg) => {
      this.isHost = msg.hostId === this.client.clientId;
      this.renderControls();
    });

    this.client.on('ROUND_START', (msg) => {
      this.round = msg.round;
      this.currentCard = msg.currentCard;
      this.previousCard = msg.previousCard;
      this.countdown = msg.countdown;
      this.inventory = msg.inventory || [];
      this.frozen = msg.frozen || false;
      this.hasPlayed = false;
      this.renderGame();
    });

    this.client.on('COUNTDOWN', (msg) => {
      this.countdown = msg.seconds;
      this.updateCountdown();
    });

    this.client.on('CARD_PLAYED', (msg) => {
      if (msg.playerId === this.client.clientId) this.hasPlayed = true;
      this.renderPlayerStatus(msg.playerId, true);
    });

    this.client.on('ROUND_RESULT', (msg) => {
      this.currentCard = msg.revealedCard;
      this.previousCard = msg.previousCard;
      this.renderRoundResult(msg.results, msg.scores, msg.specialEffects || []);
    });

    this.client.on('GAME_OVER', (msg) => {
      this.renderGameOver(msg.leaderboard);
    });
  }

  show(roomId: string): void {
    this.roomId = roomId;
  }

  hide(): void {
    this.container.innerHTML = '';
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="mp-game">
        <div class="mp-header">
          <button id="leave-room-btn" class="btn btn-small">← Leave</button>
          <span class="mp-room-name">Room: ${this.roomId}</span>
          <span class="mp-round" id="mp-round">Waiting...</span>
        </div>

        <div class="mp-players" id="mp-players"></div>

        <div class="mp-table">
          <div class="mp-cards">
            <div class="mp-card mp-prev" id="mp-prev-card">
              <div class="card-placeholder">?</div>
            </div>
            <div class="mp-arrow">→</div>
            <div class="mp-card mp-current" id="mp-current-card">
              <div class="card-placeholder">?</div>
            </div>
          </div>
          <div class="mp-countdown" id="mp-countdown"></div>
        </div>

        <div class="mp-controls" id="mp-controls"></div>

        <div class="mp-result" id="mp-result" style="display:none"></div>
        <div class="mp-gameover" id="mp-gameover" style="display:none"></div>
      </div>
    `;

    document.getElementById('leave-room-btn')?.addEventListener('click', () => {
      this.client.leaveRoom();
      this.onLeaveRoom();
    });

    this.renderPlayers();
    this.renderControls();
  }

  private renderPlayers(): void {
    const el = document.getElementById('mp-players');
    if (!el) return;
    el.innerHTML = this.players.map(p => `
      <div class="mp-player ${p.id === this.client.clientId ? 'mp-player-self' : ''}" id="player-${p.id}">
        <span class="mp-player-avatar">${p.avatarUrl ? `<img src="${p.avatarUrl}" width="24" height="24" style="border-radius:50%">` : '👤'}</span>
        <span class="mp-player-name">${p.name}${p.id === this.client.clientId ? ' (you)' : ''}</span>
        <span class="mp-player-score">${p.score || 0}</span>
        <span class="mp-player-status" id="status-${p.id}">●</span>
      </div>
    `).join('');
  }

  private renderControls(): void {
    const el = document.getElementById('mp-controls');
    if (!el) return;

    if (this.round === 0) {
      if (this.isHost) {
        el.innerHTML = `
          <button id="start-game-btn" class="btn btn-primary btn-large">🎲 Start Game (${this.players.length} players)</button>
          <button id="add-bot-btn" class="btn btn-secondary" style="margin-top:6px;width:100%">🤖 Add Bot</button>
        `;
        document.getElementById('start-game-btn')?.addEventListener('click', () => { this.client.startGame(); });
        document.getElementById('add-bot-btn')?.addEventListener('click', () => { this.client.addBot(); });
      } else {
        el.innerHTML = '<p class="waiting-text">Waiting for host to start...</p>';
      }
    }
  }

  private renderGame(): void {
    const roundEl = document.getElementById('mp-round');
    if (roundEl) roundEl.textContent = `Round ${this.round}`;

    const resultEl = document.getElementById('mp-result');
    if (resultEl) resultEl.style.display = 'none';

    this.renderCard('mp-prev-card', this.previousCard);
    this.renderCard('mp-current-card', this.currentCard);
    this.updateCountdown();

    const el = document.getElementById('mp-controls');
    if (!el) return;

    if (this.frozen) {
      el.innerHTML = '<p class="waiting-text">🧊 Frozen! Cannot play this round.</p>';
    } else if (this.hasPlayed) {
      el.innerHTML = '<p class="waiting-text">Card played! Waiting for others...</p>';
    } else {
      // Special card names for display
      const CARD_INFO: Record<string, { emoji: string; name: string }> = {
        protective_shell: { emoji: '🛡️', name: 'Shield' },
        mass_intelligence: { emoji: '🧠', name: 'Mass Intel' },
        double_points: { emoji: '💰', name: '2x Points' },
        peek: { emoji: '👁️', name: 'Peek' },
        sacrifice: { emoji: '💀', name: 'Sacrifice' },
        swap: { emoji: '🔄', name: 'Swap' },
        reveal_hand: { emoji: '🃏', name: 'Reveal' },
        freeze: { emoji: '🧊', name: 'Freeze' },
        one_for_the_team: { emoji: '🤝', name: 'Team Save' },
        second_chance: { emoji: '🔮', name: '2nd Chance' },
        point_steal: { emoji: '🏴‍☠️', name: 'Steal' },
      };

      el.innerHTML = `
        <div class="mp-guess-buttons">
          <button class="btn btn-guess btn-up" data-guess="up">⬆️ Higher</button>
          <button class="btn btn-guess btn-equal" data-guess="equal">⚖️ Equal</button>
          <button class="btn btn-guess btn-down" data-guess="down">⬇️ Lower</button>
        </div>
        ${this.inventory.length > 0 ? `
          <div class="mp-special-cards">
            ${this.inventory.map(cardId => {
              const info = CARD_INFO[cardId] || { emoji: '🎴', name: cardId };
              return `<button class="btn btn-special" data-card="${cardId}">${info.emoji} ${info.name}</button>`;
            }).join('')}
          </div>
        ` : ''}
      `;

      el.querySelectorAll('.btn-special').forEach(btn => {
        btn.addEventListener('click', () => {
          const cardId = (btn as HTMLElement).dataset.card!;
          this.client.playSpecial(cardId);
          (btn as HTMLButtonElement).disabled = true;
          (btn as HTMLElement).style.opacity = '0.4';
        });
      });

      el.querySelectorAll('.btn-guess').forEach(btn => {
        btn.addEventListener('click', () => {
          const guess = (btn as HTMLElement).dataset.guess as 'up' | 'down' | 'equal';
          this.client.playCard(guess);
          this.hasPlayed = true;
          el.innerHTML = '<p class="waiting-text">Card played! ✅</p>';
        });
      });
    }
  }

  private renderCard(elementId: string, card: Card | null): void {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (!card) {
      el.innerHTML = '<div class="card-placeholder">?</div>';
      return;
    }

    const suitSymbol: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    const suitColor = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';

    el.innerHTML = `
      <div class="playing-card ${suitColor}">
        <span class="card-value">${card.value}</span>
        <span class="card-suit">${suitSymbol[card.suit] || card.suit}</span>
      </div>
    `;
  }

  private updateCountdown(): void {
    const el = document.getElementById('mp-countdown');
    if (!el) return;
    if (this.countdown > 0) {
      el.textContent = `⏱️ ${this.countdown}s`;
      el.className = `mp-countdown ${this.countdown <= 3 ? 'mp-countdown-urgent' : ''}`;
    } else {
      el.textContent = '';
    }
  }

  private renderPlayerStatus(playerId: string, hasPlayed: boolean): void {
    const el = document.getElementById(`status-${playerId}`);
    if (el) el.textContent = hasPlayed ? '✅' : '●';
  }

  private renderRoundResult(results: any[], scores: PlayerScore[], specialEffects: any[]): void {
    const el = document.getElementById('mp-result');
    if (!el) return;

    const myResult = results.find(r => r.playerId === this.client.clientId);
    const myEffects = specialEffects.filter((e: any) => e.playerId === this.client.clientId);

    el.style.display = 'block';
    el.innerHTML = `
      <div class="mp-result-card ${myResult?.correct ? 'mp-result-correct' : 'mp-result-wrong'}">
        <h3>${myResult?.correct ? '✅ Correct!' : myResult?.eliminated ? '💀 Eliminated!' : '❌ Wrong!'}</h3>
        <p>You guessed: ${myResult?.guess || 'nothing'} | +${myResult?.score || 0} pts ${myResult?.streak ? `(${myResult.streak}🔥)` : ''}</p>
        ${myEffects.length > 0 ? `<div class="mp-effects">${myEffects.map((e: any) => `<p class="mp-effect">${e.message}</p>`).join('')}</div>` : ''}
      </div>
      ${specialEffects.length > 0 ? `
        <div class="mp-all-effects">
          ${specialEffects.filter((e: any) => e.playerId !== this.client.clientId).map((e: any) => `<p class="mp-effect-other">${e.message}</p>`).join('')}
        </div>
      ` : ''}
      <div class="mp-scores">
        ${scores.map(s => `
          <div class="mp-score-row ${!s.alive ? 'mp-eliminated' : ''} ${s.id === this.client.clientId ? 'mp-score-self' : ''}">
            <span>${s.name}</span>
            <span>${s.score} pts (${s.streak}🔥)</span>
            <span>${s.alive ? '✅' : '💀'}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Update player scores in player list
    scores.forEach(s => {
      const p = this.players.find(pl => pl.id === s.id);
      if (p) { p.score = s.score; p.alive = s.alive; }
    });
    this.renderPlayers();
  }

  private renderGameOver(leaderboard: any[]): void {
    const el = document.getElementById('mp-gameover');
    if (!el) return;

    const myEntry = leaderboard.find((e: any) => e.playerId === this.client.clientId);

    el.style.display = 'block';
    el.innerHTML = `
      <div class="mp-gameover-content">
        <h2>🏆 Game Over!</h2>
        ${myEntry ? `
          <div class="mp-your-result">
            <div class="mp-your-rank">${myEntry.rank === 1 ? '🥇' : myEntry.rank === 2 ? '🥈' : myEntry.rank === 3 ? '🥉' : `#${myEntry.rank}`}</div>
            <div class="mp-your-stats">
              <span>${myEntry.score} pts</span>
              <span>${myEntry.rounds} rounds</span>
              <span>${myEntry.maxStreak || 0}🔥 best streak</span>
            </div>
            <div class="mp-diamonds">💎 +${myEntry.diamonds || 0} diamonds earned</div>
          </div>
        ` : ''}
        <div class="mp-leaderboard">
          ${leaderboard.map((entry: any) => `
            <div class="mp-lb-row ${entry.playerId === this.client.clientId ? 'mp-lb-self' : ''}">
              <span class="mp-lb-rank">${entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}</span>
              <span class="mp-lb-name">${entry.name}</span>
              <span class="mp-lb-score">${entry.score} pts</span>
              <span class="mp-lb-diamonds">💎${entry.diamonds || 0}</span>
            </div>
          `).join('')}
        </div>
        <button id="play-again-btn" class="btn btn-primary btn-large">🔄 Play Again</button>
        <button id="back-lobby-btn" class="btn btn-secondary">← Back to Lobby</button>
      </div>
    `;

    document.getElementById('play-again-btn')?.addEventListener('click', () => {
      if (this.isHost) this.client.startGame();
    });

    document.getElementById('back-lobby-btn')?.addEventListener('click', () => {
      this.client.leaveRoom();
      this.onLeaveRoom();
    });
  }
}
