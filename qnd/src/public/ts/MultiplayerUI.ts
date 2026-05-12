/**
 * MultiplayerUI — In-game multiplayer screen
 * QnD Sprint 3: Shows table, players, GM card, countdown, Up/Down/Equal buttons
 */

import { WebSocketClient, shareOrCopy } from './WebSocketClient.js';
import { MSG } from '../../shared/MessageTypes.js';
import { renderHeader } from './components/Header.js';

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
  private isSpectator: boolean = false;
  private chatMessages: { senderId: string; senderName: string; text: string }[] = [];
  private countdownEnabled: boolean = true;
  private onLeaveRoom: () => void;

  constructor(client: WebSocketClient, container: HTMLElement, onLeaveRoom: () => void) {
    this.client = client;
    this.container = container;
    this.onLeaveRoom = onLeaveRoom;

    this.client.on(MSG.ROOM_JOINED, (msg) => {
      this.roomId = msg.room.id;
      this.isHost = msg.room.hostId === this.client.clientId;
      this.players = msg.players;
      this.render();
    });

    this.client.on(MSG.PLAYER_JOINED, (msg) => {
      this.players.push(msg.player);
      this.renderPlayers();
      this.renderControls();
    });

    this.client.on(MSG.PLAYER_LEFT, (msg) => {
      this.players = this.players.filter(p => p.id !== msg.playerId);
      this.renderPlayers();
      this.renderControls();
    });

    this.client.on(MSG.HOST_CHANGED, (msg) => {
      this.isHost = msg.hostId === this.client.clientId;
      this.renderControls();
    });

    this.client.on(MSG.ROUND_START, (msg) => {
      this.round = msg.round;
      this.currentCard = msg.currentCard;
      this.previousCard = msg.previousCard;
      this.countdown = msg.countdown;
      this.countdownEnabled = msg.countdownEnabled !== false;
      this.inventory = msg.inventory || [];
      this.frozen = msg.frozen || false;
      this.hasPlayed = false;
      this.renderGame();
    });

    this.client.on(MSG.COUNTDOWN, (msg) => {
      this.countdown = msg.seconds;
      this.updateCountdown();
    });

    this.client.on(MSG.CARD_PLAYED, (msg) => {
      if (msg.playerId === this.client.clientId) this.hasPlayed = true;
      this.renderPlayerStatus(msg.playerId, true);
    });

    this.client.on(MSG.ROUND_RESULT, (msg) => {
      this.countdownEnabled = msg.countdownEnabled !== false;
      this.renderRoundResult(msg.previousCard, msg.revealedCard, msg.results, msg.scores, msg.specialEffects || []);
      this.previousCard = msg.previousCard;
      this.currentCard = msg.revealedCard;
    });

    this.client.on(MSG.GAME_OVER, (msg) => {
      this.renderGameOver(msg.leaderboard);
    });

    this.client.on(MSG.ROOM_RESET, (msg) => {
      this.round = 0;
      this.currentCard = null;
      this.previousCard = null;
      this.hasPlayed = false;
      this.inventory = [];
      this.frozen = false;
      this.isHost = msg.hostId === this.client.clientId;
      this.players = msg.players || [];
      if (msg.chatHistory) {
        this.chatMessages = msg.chatHistory.map((m: any) => ({ senderId: m.senderId, senderName: m.senderName, text: m.text }));
      }
      this.render();
      this.renderChatMessages();
    });

    this.client.on(MSG.COUNTDOWN_SETTING, (msg) => {
      this.countdownEnabled = msg.countdownEnabled;
      this.renderControls();
    });


    this.client.on(MSG.SPECTATE_JOINED, (msg) => {
      this.isSpectator = true;
      this.roomId = msg.room.id;
      this.players = msg.players;
      this.currentCard = msg.currentCard;
      this.previousCard = msg.previousCard;
      this.round = msg.round;
      this.render();
      if (msg.state !== 'waiting') {
        this.renderCard('mp-prev-card', this.previousCard);
        this.renderCard('mp-current-card', this.currentCard);
      }
    });

    this.client.on(MSG.SPECTATE_LEFT, () => {
      this.isSpectator = false;
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
      <div id="mp-header-slot"></div>
      <div class="mp-game">

        <div class="mp-players" id="mp-players"></div>

        <div class="mp-table">
          <div class="mp-cards">
            <div class="mp-card-col">
              <span class="mp-card-label">Previous</span>
              <div class="mp-card mp-prev" id="mp-prev-card">
                <div class="card-placeholder">?</div>
              </div>
            </div>
            <div class="mp-arrow">→</div>
            <div class="mp-card-col">
              <span class="mp-card-label">Current</span>
              <div class="mp-card mp-current" id="mp-current-card">
                <div class="card-placeholder">?</div>
              </div>
            </div>
          </div>
          <div class="mp-countdown" id="mp-countdown"></div>
        </div>

        <div class="mp-controls" id="mp-controls"></div>

        <div class="mp-result" id="mp-result" style="display:none"></div>
        <div class="mp-gameover" id="mp-gameover" style="display:none"></div>
      </div>

      <div class="chat-sheet" id="chat-sheet">
        <div class="chat-handle" id="chat-handle"><div class="chat-handle-bar"></div></div>
        <div class="chat-invite" id="chat-invite">
          <button id="chat-invite-btn" class="btn btn-small btn-primary">📨 Invite</button>
          <span class="chat-invite-label">Share room link</span>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-bar">
          <input type="text" id="chat-input" placeholder="Message..." maxlength="200" autocomplete="off">
          <button id="chat-send" class="btn btn-small btn-primary">Send</button>
        </div>
      </div>
    `;

    // Insert shared header with Leave + Fullscreen buttons
    const slot = document.getElementById('mp-header-slot');
    if (slot) {
      slot.replaceWith(renderHeader({
        leftButton: { icon: '←', onClick: () => {
          if (this.isSpectator) { this.client.leaveSpectate(); } else { this.client.leaveRoom(); }
          this.isSpectator = false;
          this.onLeaveRoom();
        }},
        centerText: `<span class="mp-round" id="mp-round"></span>`,
        rightButtons: [
          { icon: '⛶', onClick: () => {
            if (document.fullscreenElement) { document.exitFullscreen(); }
            else { document.documentElement.requestFullscreen().catch(() => {}); }
          }}
        ]
      }));
    }

    this.renderPlayers();
    this.renderControls();
    this.setupChat();
    this.setupKeybindings();

    // Profile overlay (hidden by default)
    const profileEl = document.createElement('div');
    profileEl.id = 'player-profile';
    profileEl.className = 'profile-overlay';
    profileEl.style.display = 'none';
    profileEl.addEventListener('click', (e) => {
      if (e.target === profileEl) profileEl.style.display = 'none';
    });
    document.body.appendChild(profileEl);
  }

  private setupChat(): void {
    const sheet = document.getElementById('chat-sheet');
    const handle = document.getElementById('chat-handle');
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const sendBtn = document.getElementById('chat-send');
    if (!sheet || !handle || !input || !sendBtn) return;

    // Invite button in chat header
    document.getElementById('chat-invite-btn')?.addEventListener('click', async () => {
      const base = (window as any).__shareBase || location.origin;
      await shareOrCopy(`${base}/mp?join=${this.roomId}`, document.getElementById('chat-invite-btn') as HTMLElement);
    });

    let expanded = false;

    // Toggle expand/collapse on handle tap
    handle.addEventListener('click', () => {
      expanded = !expanded;
      sheet.classList.toggle('chat-expanded', expanded);
    });

    // Touch drag on handle
    let startY = 0;
    handle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    handle.addEventListener('touchmove', (e) => {
      const dy = startY - e.touches[0].clientY;
      if (dy > 30 && !expanded) { expanded = true; sheet.classList.add('chat-expanded'); }
      if (dy < -30 && expanded) { expanded = false; sheet.classList.remove('chat-expanded'); }
    }, { passive: true });

    // Send message
    const doSend = () => {
      const text = input.value.trim();
      if (!text) return;
      this.client.sendChat(text);
      input.value = '';
    };
    sendBtn.addEventListener('click', doSend);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSend(); });

    // Receive messages
    this.client.on(MSG.CHAT_HISTORY, (msg: any) => {
      if (!msg.messages) return;
      this.chatMessages = msg.messages.map((m: any) => ({ senderId: m.senderId, senderName: m.senderName, text: m.text }));
      this.renderChatMessages();
    });

    this.client.on(MSG.CHAT_MESSAGE, (msg: any) => {
      this.chatMessages.push({ senderId: msg.senderId, senderName: msg.senderName, text: msg.text });
      this.appendChatMessage(msg);
      // Show preview on handle when collapsed
      if (!expanded && handle) {
        handle.innerHTML = `<div class="chat-preview"><b>${msg.senderName}:</b> ${(msg.text || '').slice(0, 40)}</div>`;
        sheet!.classList.add('chat-peek');
        setTimeout(() => {
          handle!.innerHTML = '<div class="chat-handle-bar"></div>';
          sheet!.classList.remove('chat-peek');
        }, 4000);
      }
    });
  }

  private renderPlayers(): void {
    const el = document.getElementById('mp-players');
    if (!el) return;
    el.innerHTML = this.players.map(p => `
      <div class="mp-player ${p.id === this.client.clientId ? 'mp-player-self' : ''}" id="player-${p.id}" data-pid="${p.id}">
        <span class="mp-player-avatar">${p.avatarUrl ? `<img src="${p.avatarUrl}" width="24" height="24" style="border-radius:50%">` : '👤'}</span>
        <span class="mp-player-name mp-clickable" data-pid="${p.id}">${p.name}${p.id === this.client.clientId ? ' (you)' : ''}</span>
        <span class="mp-player-score">${p.score || 0}</span>
        <span class="mp-player-status" id="status-${p.id}">●</span>
      </div>
    `).join('');

    el.querySelectorAll('.mp-clickable').forEach(name => {
      name.addEventListener('click', () => {
        const pid = (name as HTMLElement).dataset.pid!;
        this.showProfile(pid);
      });
    });
  }

  private showProfile(playerId: string): void {
    const p = this.players.find(pl => pl.id === playerId);
    if (!p) return;

    const isBot = p.name.includes('🤖');
    const profileEl = document.getElementById('player-profile');
    if (!profileEl) return;

    profileEl.style.display = 'flex';
    profileEl.innerHTML = `
      <div class="profile-sheet">
        <div class="chat-handle"><div class="chat-handle-bar"></div></div>
        <div class="profile-avatar">${p.avatarUrl ? `<img src="${p.avatarUrl}" width="64" height="64" style="border-radius:50%">` : (isBot ? '🤖' : '👤')}</div>
        <h3 class="profile-name">${p.name}</h3>
        ${isBot ? '<p class="profile-bot-type">AI Bot — Card-counting heuristic</p>' : ''}
        <div class="profile-stats">
          <div class="profile-stat"><span class="profile-stat-val">${p.score || 0}</span><span class="profile-stat-label">Score</span></div>
          <div class="profile-stat"><span class="profile-stat-val">${p.alive !== false ? '✅' : '💀'}</span><span class="profile-stat-label">Status</span></div>
          <div class="profile-stat"><span class="profile-stat-val">${this.round}</span><span class="profile-stat-label">Round</span></div>
        </div>
        <button class="btn btn-secondary profile-close" style="margin-top:12px;width:100%">Close</button>
      </div>
    `;

    profileEl.querySelector('.profile-close')?.addEventListener('click', () => {
      profileEl.style.display = 'none';
    });

    // Touch drag down to dismiss
    let startY = 0;
    const sheet = profileEl.querySelector('.profile-sheet') as HTMLElement;
    sheet?.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    sheet?.addEventListener('touchmove', (e) => {
      if (e.touches[0].clientY - startY > 50) profileEl.style.display = 'none';
    }, { passive: true });
  }

  private renderControls(): void {
    const el = document.getElementById('mp-controls');
    if (!el) return;

    if (this.isSpectator) {
      el.innerHTML = `
        <p class="waiting-text">👁️ Spectating</p>
        <button id="join-next-btn" class="btn btn-primary" style="margin-top:6px;width:100%">🎮 Join Next Game</button>
      `;
      document.getElementById('join-next-btn')?.addEventListener('click', () => {
        this.client.joinNextGame(localStorage.getItem('updown-name') || 'Player');
      });
    } else if (this.round === 0) {
      const inviteBtn = `<button id="invite-btn" class="btn btn-secondary" style="margin-top:6px;width:100%">📨 Invite Friends</button>`;
      if (this.isHost) {
        el.innerHTML = `
          <button id="start-game-btn" class="btn btn-primary btn-large">🎲 Start Game (${this.players.length} players)</button>
          <button id="add-bot-btn" class="btn btn-secondary" style="margin-top:6px;width:100%">🤖 Add Bot</button>
          <button id="toggle-countdown-btn" class="btn btn-secondary" style="margin-top:6px;width:100%">⏱️ Countdown: ${this.countdownEnabled ? 'ON' : 'OFF'}</button>
          ${inviteBtn}
        `;
        document.getElementById('start-game-btn')?.addEventListener('click', () => { this.client.startGame(); });
        document.getElementById('add-bot-btn')?.addEventListener('click', () => { this.client.addBot(); });
        document.getElementById('toggle-countdown-btn')?.addEventListener('click', () => { this.client.send({ type: MSG.TOGGLE_COUNTDOWN }); });
      } else {
        el.innerHTML = `<p class="waiting-text">Waiting for host to start...</p>${inviteBtn}`;
      }
      document.getElementById('invite-btn')?.addEventListener('click', async () => {
        const base = (window as any).__shareBase || location.origin;
        await shareOrCopy(`${base}/mp?join=${this.roomId}`, document.getElementById('invite-btn') as HTMLElement);
      });
    }
  }

  private renderGame(): void {
    const roundEl = document.getElementById('mp-round');
    if (roundEl) roundEl.textContent = `Round ${this.round}${this.isSpectator ? ' 👁️' : ''}`;

    const resultEl = document.getElementById('mp-result');
    if (resultEl) resultEl.style.display = 'none';

    this.renderCard('mp-prev-card', this.previousCard);
    this.renderCard('mp-current-card', this.currentCard);
    this.updateCountdown();

    const el = document.getElementById('mp-controls');
    if (!el) return;

    if (this.isSpectator) {
      el.innerHTML = '<p class="waiting-text">👁️ Watching — players are choosing...</p>';
    } else if (this.frozen) {
      el.innerHTML = '<p class="waiting-text">🧊 Frozen! Cannot play this round.</p>';
    } else if (this.hasPlayed) {
      const forceBtn = (this.isHost && !this.countdownEnabled) ? '<button id="force-next-btn" class="btn btn-primary" style="margin-top:8px;width:100%">⏩ Next Round</button>' : '';
      el.innerHTML = `<p class="waiting-text">Card played! ${this.countdownEnabled ? 'Waiting for others...' : 'Waiting for host...'}</p>${forceBtn}`;
      document.getElementById('force-next-btn')?.addEventListener('click', () => { this.client.send({ type: MSG.FORCE_NEXT_ROUND }); });
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
          <button class="btn btn-guess btn-up" data-guess="up">⬆️ Higher <kbd>U</kbd></button>
          <button class="btn btn-guess btn-equal" data-guess="equal">⚖️ Equal <kbd>E</kbd></button>
          <button class="btn btn-guess btn-down" data-guess="down">⬇️ Lower <kbd>D</kbd></button>
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
      <div class="playing-card ${suitColor} card-flip-in">
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

  private cardText(card: Card | null): string {
    if (!card) return '?';
    const suit: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    return `${card.value}${suit[card.suit] || card.suit}`;
  }

  private cardHtml(card: Card | null, size: 'small' | 'normal' = 'normal'): string {
    if (!card) return '<div class="card-placeholder">?</div>';
    const suit: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    const color = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';
    const cls = size === 'small' ? 'playing-card playing-card-sm' : 'playing-card';
    return `<div class="${cls} ${color}"><span class="card-value">${card.value}</span><span class="card-suit">${suit[card.suit] || card.suit}</span></div>`;
  }

  private renderRoundResult(betCard: Card | null, revealedCard: Card | null, results: any[], scores: PlayerScore[], specialEffects: any[]): void {
    const el = document.getElementById('mp-result');
    if (!el) return;

    const myResult = results.find(r => r.playerId === this.client.clientId);
    const myEffects = specialEffects.filter((e: any) => e.playerId === this.client.clientId);

    // Build explanation
    const guessLabel: Record<string, string> = { up: '⬆️ HIGHER', down: '⬇️ LOWER', equal: '⚖️ EQUAL' };
    const guessText = myResult?.guess ? guessLabel[myResult.guess] || myResult.guess : 'nothing';
    let comparison = '';
    if (betCard && revealedCard) {
      if (revealedCard.numericValue > betCard.numericValue) comparison = 'went UP';
      else if (revealedCard.numericValue < betCard.numericValue) comparison = 'went DOWN';
      else comparison = 'stayed EQUAL';
    }

    // Update the table cards visually
    this.renderCard('mp-prev-card', betCard);
    this.renderCard('mp-current-card', revealedCard);

    el.style.display = 'block';
    el.innerHTML = `
      <div class="mp-result-card ${myResult?.correct ? 'mp-result-correct' : 'mp-result-wrong'}">
        <h3>${myResult?.correct ? '✅ Correct!' : myResult?.eliminated ? '💀 Eliminated!' : '❌ Wrong!'}</h3>
        <div class="mp-result-explain">
          <span>You bet ${guessText}</span>
          <div class="mp-result-cards">
            ${this.cardHtml(betCard, 'small')}
            <span class="mp-result-arrow">→</span>
            ${this.cardHtml(revealedCard, 'small')}
          </div>
          <span class="mp-result-comparison">${this.cardText(betCard)} ${comparison} to ${this.cardText(revealedCard)}</span>
        </div>
        <p class="mp-result-points">+${myResult?.roundScore || 0} pts ${myResult?.streak ? `(${myResult.streak}🔥 streak)` : ''} | Total: ${myResult?.score || 0}</p>
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

    // Show enforce button in mp-controls (above result, always visible)
    if (!this.countdownEnabled) {
      const controls = document.getElementById('mp-controls');
      if (controls) {
        controls.innerHTML = this.isHost
          ? '<button id="enforce-next-btn" class="btn btn-primary" style="width:100%">Enforce Next Round ▶</button>'
          : '<p class="waiting-text">Waiting for host...</p>';
        document.getElementById('enforce-next-btn')?.addEventListener('click', () => {
          this.client.send({ type: MSG.FORCE_NEXT_ROUND });
        });
        document.getElementById('enforce-next-btn')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

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

    el.style.display = 'flex';
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
      // Stay connected — send PLAY_AGAIN, server resets room, broadcasts ROOM_RESET
      this.client.send({ type: MSG.PLAY_AGAIN });
    });

    document.getElementById('back-lobby-btn')?.addEventListener('click', () => {
      this.client.leaveRoom();
      this.onLeaveRoom();
    });
  }

  private setupKeybindings(): void {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in chat
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (this.hasPlayed || this.frozen || this.state === 'finished' || this.round === 0) return;

      const key = e.key.toLowerCase();
      if (key === 'u' || key === 'arrowup') { this.client.playCard('up'); this.hasPlayed = true; this.renderGame(); }
      else if (key === 'd' || key === 'arrowdown') { this.client.playCard('down'); this.hasPlayed = true; this.renderGame(); }
      else if (key === 'e' || key === 'arrowleft' || key === 'arrowright') { this.client.playCard('equal'); this.hasPlayed = true; this.renderGame(); }
    };
    document.addEventListener('keydown', handler);
  }

  private get state(): string { return this.round > 0 && !this.hasPlayed ? 'playing' : this.round === 0 ? 'waiting' : 'played'; }

  private renderChatMessages(): void {
    const el = document.getElementById('chat-messages');
    if (!el) return;
    el.innerHTML = '';
    for (const m of this.chatMessages) {
      const div = document.createElement('div');
      div.className = `chat-msg ${m.senderId === this.client.clientId ? 'chat-self' : ''}`;
      div.innerHTML = `<span class="chat-name">${m.senderName}</span> ${m.text}`;
      el.appendChild(div);
    }
    el.scrollTop = el.scrollHeight;
  }

  private appendChatMessage(msg: { senderId: string; senderName: string; text: string }): void {
    const el = document.getElementById('chat-messages');
    if (!el) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.senderId === this.client.clientId ? 'chat-self' : ''}`;
    div.innerHTML = `<span class="chat-name">${msg.senderName}</span> ${msg.text}`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }
}
