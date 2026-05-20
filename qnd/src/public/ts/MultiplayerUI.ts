/**
 * MultiplayerUI — In-game multiplayer screen
 * QnD Sprint 3: Shows table, players, GM card, countdown, Up/Down/Equal buttons
 */

import { WebSocketClient, shareOrCopy, guardClick } from './WebSocketClient.js';
import QRCode from 'qrcode';
import { MSG } from '../../shared/MessageTypes.js';
import { suitSymbol, cardColor, cardToHtml, cardText } from '../../ts/shared/CardUtils.js';
import { CARD_INFO_MAP } from '../../ts/shared/SpecialCardInfo.js';
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
  private roomName: string = '';
  private roomKey: string = '';
  private isHost: boolean = false;
  private players: any[] = [];
  private currentCard: Card | null = null;
  private previousCard: Card | null = null;
  private countdown: number = 0;
  private hasPlayed: boolean = false;
  private round: number = 0;
  private inventory: string[] = [];
  private playerLevel: number = 1;
  private selectedSpecialCard: string | null = null;
  private frozen: boolean = false;
  private eliminated: boolean = false;
  private isSpectator: boolean = false;
  private chatMessages: { senderId: string; senderName: string; text: string }[] = [];
  private countdownEnabled: boolean = true;
  private chatExpanded: boolean = false;
  private myProfile: any = null;
  private onLeaveRoom: () => void;

  constructor(client: WebSocketClient, container: HTMLElement, onLeaveRoom: () => void) {
    this.client = client;
    this.container = container;
    this.onLeaveRoom = onLeaveRoom;
    this.setupKeybindings();

    this.client.on(MSG.ROOM_JOINED, (msg) => {
      this.resetState();
      this.roomId = msg.room.id;
      this.roomName = msg.room.name || '';
      this.roomKey = msg.room.roomKey || '';
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
      if (this.round > 0) this.renderGame(); else this.renderControls();
    });

    this.client.on(MSG.ROUND_START, (msg) => {
      this.round = msg.round;
      this.currentCard = msg.currentCard;
      this.previousCard = msg.previousCard;
      this.countdown = msg.countdown;
      this.countdownEnabled = msg.countdownEnabled !== false;
      this.inventory = msg.inventory || [];
      this.frozen = msg.frozen || false;
      this.playerLevel = msg.level || 1;
      this.selectedSpecialCard = null;
      this.hasPlayed = false;
      this.eliminated = msg.alivePlayers ? !msg.alivePlayers.includes(this.client.clientId) : false;
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
      const myRes = msg.results?.find((r: any) => r.playerId === this.client.clientId);
      if (myRes?.eliminated) this.eliminated = true;
      this.renderRoundResult(msg.previousCard, msg.revealedCard, msg.results, msg.scores, msg.specialEffects || []);
      this.previousCard = msg.previousCard;
      this.currentCard = msg.revealedCard;
    });

    this.client.on(MSG.GAME_OVER, (msg) => {
      this.renderGameOver(msg.leaderboard);
    });

    this.client.on(MSG.ROOM_RESET, (msg) => {
      this.resetState();
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

    // WS status + chat handlers registered ONCE (not in setupChat which re-runs on each render)
    this.client.on('disconnected', () => this.updateWsStatus('disconnected'));
    this.client.on('reconnecting', () => this.updateWsStatus('reconnecting'));
    this.client.on('reconnected', () => this.updateWsStatus('connected'));

    this.client.on(MSG.CHAT_HISTORY, (msg: any) => {
      if (!msg.messages) return;
      this.chatMessages = msg.messages.map((m: any) => ({ senderId: m.senderId, senderName: m.senderName, text: m.text }));
      this.renderChatMessages();
    });

    this.client.on(MSG.CHAT_MESSAGE, (msg: any) => {
      this.chatMessages.push({ senderId: msg.senderId, senderName: msg.senderName, text: msg.text });
      this.appendChatMessage(msg);
      if (!this.chatExpanded) {
        const handle = document.getElementById('chat-handle');
        const sheet = document.getElementById('chat-sheet');
        if (handle && sheet) {
          const preview = document.createElement('div'); preview.className = 'chat-preview';
          const b = document.createElement('b'); b.textContent = `${msg.senderName}:`; preview.appendChild(b);
          preview.appendChild(document.createTextNode(' ' + (msg.text || '').replace(/\n/g, ' ').slice(0, 40)));
          handle.innerHTML = ''; handle.appendChild(preview);
          sheet.classList.add('chat-peek');
          setTimeout(() => {
            handle.innerHTML = '<div class="chat-handle-bar"></div>';
            sheet.classList.remove('chat-peek');
          }, 4000);
        }
      }
    });

    this.client.on(MSG.CONSOLIDATE_OK, (msg: any) => {
      alert(`Account linked! Merged ${msg.mergedDevices} device(s) and ${msg.mergedGames} game(s).`);
    });
    this.client.on(MSG.CONSOLIDATE_FAILED, (msg: any) => {
      alert(`Link failed: ${msg.reason}`);
    });

    this.client.on(MSG.PROFILE, (msg: any) => {
      if (msg.profile) this.myProfile = msg.profile;
    });
  }

  show(roomId: string): void {
    this.roomId = roomId;
  }

  hide(): void {
    this.container.innerHTML = '';
  }

  private resetState(): void {
    this.round = 0;
    this.currentCard = null;
    this.previousCard = null;
    this.hasPlayed = false;
    this.eliminated = false;
    this.isSpectator = false;
    this.frozen = false;
    this.countdown = 0;
    this.countdownEnabled = true;
    this.inventory = [];
    this.playerLevel = 1;
    this.selectedSpecialCard = null;
    this.chatMessages = [];
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="game-container">
      <header class="game-header mp-header" style="position:relative">
        <button id="leave-btn" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;opacity:0.6;padding:8px;z-index:10">←</button>
        <h1>🎴 UpDown</h1>
        <div style="position:absolute;right:2px;top:50%;transform:translateY(-50%);display:flex;gap:0;z-index:10">
          <a id="home-btn" href="/" style="color:white;font-size:0.9rem;opacity:0.5;padding:10px;text-decoration:none;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center">🏠</a>
          <button id="fullscreen-btn" style="background:none;border:none;color:white;font-size:0.9rem;opacity:0.5;padding:10px;cursor:pointer;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center">⛶</button>
        </div>
        <div class="stats">
          <div class="stat"><span class="stat-label">Round</span><span class="stat-value" id="mp-round">0</span></div>
          <div class="stat"><span class="stat-label">Players</span><span class="stat-value" id="mp-player-count">${this.players.length}</span></div>
        </div>
      </header>
      <main class="game-board mp-game">

        <div class="mp-players" id="mp-players"></div>

        <div class="cards-row">
          <div class="previous-card-container">
            <span class="card-label">Previous</span>
            <div class="card-slot empty" id="mp-prev-card">
              <span class="card-back">🂠</span>
            </div>
          </div>
          <div class="cards-arrow">→</div>
          <div class="current-card-container">
            <span class="card-label">Current</span>
            <div class="card-slot empty" id="mp-current-card">
              <span class="card-back">🂠</span>
            </div>
          </div>
        </div>
        <div class="mp-countdown" id="mp-countdown"></div>

        <div class="mp-controls" id="mp-controls"></div>

        <div class="mp-result" id="mp-result" style="display:none"></div>
        <div class="mp-gameover" id="mp-gameover" style="display:none"></div>
      </main>

      <div class="chat-sheet" id="chat-sheet">
        <div class="chat-handle" id="chat-handle"><div class="chat-handle-bar"></div></div>
        <div class="chat-invite" id="chat-invite">
          <button id="chat-invite-btn" class="btn btn-small btn-primary">📨 Invite</button>
          <span class="chat-invite-label">Share room link</span>
          <span id="ws-status" class="ws-status ws-connected" title="Connected">●</span>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-bar">
          <input type="text" id="chat-input" placeholder="Message..." maxlength="200" autocomplete="off">
          <button id="chat-send" class="btn btn-small btn-primary">Send</button>
        </div>
      </div>
      </div>
    `;

    // Leave button
    const leaveBtn = document.getElementById('leave-btn');
    if (leaveBtn) guardClick(leaveBtn, () => {
      if (this.isSpectator) { this.client.leaveSpectate(); } else { this.client.leaveRoom(); }
      this.isSpectator = false;
      this.onLeaveRoom();
    });

    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else { document.documentElement.requestFullscreen().catch(() => {}); }
    });

    this.renderPlayers();
    this.renderControls();
    this.setupChat();

    // Profile overlay — reuse existing or create once
    let profileEl = document.getElementById('player-profile');
    if (!profileEl) {
      profileEl = document.createElement('div');
      profileEl.id = 'player-profile';
      profileEl.className = 'profile-overlay';
      profileEl.style.display = 'none';
      profileEl.addEventListener('click', (e) => {
        if (e.target === profileEl) profileEl.style.display = 'none';
      });
      document.body.appendChild(profileEl);
    }
  }

  private async showQrPopup(url: string): Promise<void> {
    let overlay = document.getElementById('qr-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'qr-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px)';
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay!.style.display = 'none'; });
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div style="background:white;border-radius:16px;padding:24px;text-align:center;max-width:320px;width:90%;position:relative">
        <button id="qr-close" style="position:absolute;top:8px;right:12px;background:none;border:none;font-size:1.2rem;cursor:pointer;opacity:0.5">✕</button>
        <h3 style="margin:0 0 12px;font-size:1.1rem;color:#333">📨 Scan to Join</h3>
        <canvas id="qr-canvas" style="max-width:100%;border-radius:8px"></canvas>
        <p style="margin:10px 0 0;font-size:0.75rem;color:#999;word-break:break-all">${url}</p>
      </div>`;
    document.getElementById('qr-close')?.addEventListener('click', () => { overlay!.style.display = 'none'; });
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      try { await QRCode.toCanvas(canvas, url, { width: 240, margin: 2 }); } catch {}
    }
  }

  private confirmSpecialCard(cardId: string, targetPlayerId?: string): void {
    this.client.playSpecial(cardId, targetPlayerId);
    this.inventory = this.inventory.filter(id => id !== cardId);
    this.selectedSpecialCard = null;
    document.getElementById('target-picker')?.remove();
    this.renderGame();
  }

  private updateSpecialCardVisuals(): void {
    document.querySelectorAll('.btn-special').forEach(btn => {
      const id = (btn as HTMLElement).dataset.card;
      btn.classList.toggle('btn-special-selected', id === this.selectedSpecialCard);
      btn.classList.toggle('btn-special-dimmed', this.selectedSpecialCard !== null && id !== this.selectedSpecialCard);
    });
  }

  private showTargetPicker(cardId: string): void {
    document.getElementById('target-picker')?.remove();
    const info = CARD_INFO_MAP[cardId];
    const alivePlayers = this.players.filter(p => p.alive !== false && p.id !== this.client.clientId);
    if (alivePlayers.length === 0) { this.confirmSpecialCard(cardId); return; }
    const container = document.querySelector('.mp-special-cards');
    if (!container) return;
    const picker = document.createElement('div');
    picker.id = 'target-picker';
    picker.className = 'target-picker';
    picker.innerHTML = `<span style="width:100%;text-align:center;font-size:0.7rem;opacity:0.7">🎯 Target for ${info?.emoji || ''} ${info?.name || cardId}:</span>`
      + alivePlayers.map(p => `<button class="btn btn-join target-btn" data-tid="${p.id}">${p.name}</button>`).join('')
      + `<button class="btn btn-secondary target-cancel">Cancel</button>`;
    container.appendChild(picker);
    picker.querySelectorAll('.target-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.confirmSpecialCard(cardId, (btn as HTMLElement).dataset.tid);
      });
    });
    picker.querySelector('.target-cancel')?.addEventListener('click', () => {
      this.selectedSpecialCard = null;
      this.updateSpecialCardVisuals();
      picker.remove();
    });
  }

  private updateWsStatus(state: string): void {
    const el = document.getElementById('ws-status');
    if (!el) return;
    el.className = `ws-status ws-${state}`;
    el.title = state === 'connected' ? 'Connected' : state === 'disconnected' ? 'Disconnected' : 'Reconnecting';
  }

  private localAvatarHtml(size: number): string {
    const img = localStorage.getItem('updown-avatar');
    if (img) return `<img src="${img}" width="${size}" height="${size}" style="border-radius:50%">`;
    const card = localStorage.getItem('updown-avatar-card');
    if (card) return `<span style="font-size:${size > 32 ? '2rem' : '0.9rem'}">${card}</span>`;
    return '';
  }

  private setupChat(): void {
    const sheet = document.getElementById('chat-sheet');
    const handle = document.getElementById('chat-handle');
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const sendBtn = document.getElementById('chat-send');
    if (!sheet || !handle || !input || !sendBtn) return;

    // Invite button in chat header
    const chatInviteBtn = document.getElementById('chat-invite-btn');
    if (chatInviteBtn) guardClick(chatInviteBtn, async () => {
      const base = (window as any).__shareBase || location.origin;
      const url = `${base}/mp?join=${this.roomId}${this.roomKey ? `&key=${encodeURIComponent(this.roomKey)}` : ''}`;
      await shareOrCopy(url, chatInviteBtn, this.roomName);
    });

    // WebSocket status indicator — initial state + click handler (listeners in constructor)
    const wsStatus = document.getElementById('ws-status');
    if (wsStatus) {
      this.updateWsStatus(this.client.connected ? 'connected' : 'disconnected');
      wsStatus.style.cursor = 'pointer';
      wsStatus.addEventListener('click', async () => {
        if (this.client.connected) return;
        this.updateWsStatus('reconnecting');
        try { await this.client.reconnect(); } catch { this.updateWsStatus('disconnected'); }
      });
    }

    this.chatExpanded = false;

    // Toggle expand/collapse on handle tap
    handle.addEventListener('click', () => {
      this.chatExpanded = !this.chatExpanded;
      sheet.classList.toggle('chat-expanded', this.chatExpanded);
    });

    // Touch drag on handle
    let startY = 0;
    handle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    handle.addEventListener('touchmove', (e) => {
      const dy = startY - e.touches[0].clientY;
      if (dy > 30 && !this.chatExpanded) { this.chatExpanded = true; sheet.classList.add('chat-expanded'); }
      if (dy < -30 && this.chatExpanded) { this.chatExpanded = false; sheet.classList.remove('chat-expanded'); }
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
  }

  private renderPlayers(): void {
    const el = document.getElementById('mp-players');
    if (!el) return;
    el.innerHTML = this.players.map(p => {
      const isSelf = p.id === this.client.clientId;
      const avatar = isSelf ? (this.localAvatarHtml(24) || (p.avatarUrl ? `<img src="${p.avatarUrl}" width="24" height="24" style="border-radius:50%">` : '👤'))
        : (p.avatarUrl ? `<img src="${p.avatarUrl}" width="24" height="24" style="border-radius:50%">` : '👤');
      return `
      <div class="mp-player ${isSelf ? 'mp-player-self' : ''}" id="player-${p.id}" data-pid="${p.id}">
        <span class="mp-player-avatar">${avatar}</span>
        <span class="mp-player-name mp-clickable" data-pid="${p.id}">${p.name}${isSelf ? ' (you)' : ''}</span>
        <span class="mp-player-score">${p.score || 0}</span>
        <span class="mp-player-status" id="status-${p.id}">●</span>
      </div>`;
    }).join('');

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

    const isSelf = playerId === this.client.clientId;
    const avatar = isSelf ? (this.localAvatarHtml(64) || (p.avatarUrl ? `<img src="${p.avatarUrl}" width="64" height="64" style="border-radius:50%">` : '👤'))
      : (p.avatarUrl ? `<img src="${p.avatarUrl}" width="64" height="64" style="border-radius:50%">` : (isBot ? '🤖' : '👤'));

    profileEl.style.display = 'flex';
    profileEl.innerHTML = `
      <div class="profile-sheet">
        <div class="chat-handle"><div class="chat-handle-bar"></div></div>
        <div class="profile-avatar">${avatar}</div>
        <h3 class="profile-name">${p.name}</h3>
        ${isBot ? '<p class="profile-bot-type">AI Bot — Card-counting heuristic</p>' : ''}
        <div class="profile-stats">
          <div class="profile-stat"><span class="profile-stat-val">${p.score || 0}</span><span class="profile-stat-label">Score</span></div>
          <div class="profile-stat"><span class="profile-stat-val">${p.alive !== false ? '✅' : '💀'}</span><span class="profile-stat-label">Status</span></div>
          <div class="profile-stat"><span class="profile-stat-val">${p.streak || 0}🔥</span><span class="profile-stat-label">Streak</span></div>
          <div class="profile-stat"><span class="profile-stat-val">Lv.${isSelf ? this.playerLevel : '?'}</span><span class="profile-stat-label">Level</span></div>
        </div>
        <button id="vcard-btn" class="btn btn-secondary" style="margin-top:8px;width:100%">📇 Download vCard</button>
        ${!isSelf && !isBot ? `<button id="link-account-btn" class="btn btn-primary" style="margin-top:6px;width:100%" data-token="${p.playerToken || ''}" data-name="${p.name}">🔗 Link Account</button>` : ''}
      </div>
    `;

    document.getElementById('link-account-btn')?.addEventListener('click', () => {
      const targetToken = (document.getElementById('link-account-btn') as HTMLElement).dataset.token;
      const targetName = (document.getElementById('link-account-btn') as HTMLElement).dataset.name;
      const code = prompt(`Enter ${targetName}'s secret code to link accounts.\nThe code is a 4-digit number shown on their /profile page.\nThis cannot be undone.`);
      if (code && targetToken) {
        this.client.send({ type: MSG.CONSOLIDATE, targetToken, secretCode: code.trim() });
        profileEl.style.display = 'none';
      }
    });

    document.getElementById('vcard-btn')?.addEventListener('click', () => {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${p.name}`];
      const phone = isSelf ? (localStorage.getItem('updown-phone') || '') : (p.phone || '');
      const pUrl = isSelf ? (localStorage.getItem('updown-url') || '') : (p.url || '');
      const avatar = isSelf ? (localStorage.getItem('updown-avatar') || '') : (p.avatarUrl || '');
      const token = isSelf ? this.client.playerToken : (p.playerToken || '');
      if (phone) lines.push(`TEL:${phone}`);
      if (pUrl) lines.push(`URL:${pUrl}`);
      if (avatar && avatar.startsWith('data:image')) {
        const match = avatar.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) lines.push(`PHOTO;ENCODING=b;TYPE=${match[1].toUpperCase()}:${match[2]}`);
      }
      lines.push(`NOTE:UUID: ${token}\\nScore: ${p.score || 0}\\nStreak: ${p.streak || 0}`);
      lines.push('END:VCARD');
      const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${p.name.replace(/[^a-zA-Z0-9 ]/g, '')}.vcf`;
      a.click();
      URL.revokeObjectURL(a.href);
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
      const joinNextBtn = document.getElementById('join-next-btn');
      if (joinNextBtn) guardClick(joinNextBtn, () => {
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
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) guardClick(startBtn, () => {
          this.client.startGame();
          return this.client.waitFor(MSG.ROUND_START, MSG.ERROR);
        });
        const addBotBtn = document.getElementById('add-bot-btn');
        if (addBotBtn) guardClick(addBotBtn, () => { this.client.addBot(); });
        const toggleBtn = document.getElementById('toggle-countdown-btn');
        if (toggleBtn) guardClick(toggleBtn, () => { this.client.send({ type: MSG.TOGGLE_COUNTDOWN }); });
      } else {
        el.innerHTML = `<p class="waiting-text">Waiting for host to start...</p>${inviteBtn}`;
      }
      const invBtn = document.getElementById('invite-btn');
      if (invBtn) guardClick(invBtn, async () => {
        const base = (window as any).__shareBase || location.origin;
        const url = `${base}/mp?join=${this.roomId}${this.roomKey ? `&key=${encodeURIComponent(this.roomKey)}` : ''}`;
        this.showQrPopup(url);
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

    if (this.isSpectator || this.eliminated) {
      const aliveCount = this.players.filter(pl => pl.alive !== false).length;
      el.innerHTML = `<p class="waiting-text">👁️ ${this.eliminated ? `💀 You're eliminated! The game continues for ${aliveCount} remaining player${aliveCount !== 1 ? 's' : ''}. Watching as spectator...` : 'Watching — players are choosing...'}</p>`;
    } else if (this.frozen) {
      el.innerHTML = '<p class="waiting-text">🧊 Frozen! Cannot play this round.</p>';
    } else if (this.hasPlayed) {
      const forceBtn = (this.isHost && !this.countdownEnabled) ? '<button id="force-next-btn" class="btn btn-primary" style="margin-top:8px;width:100%">Enforce Result ▶</button>' : '';
      el.innerHTML = `<p class="waiting-text">Card played! ${this.countdownEnabled ? 'Waiting for others...' : 'Waiting for host...'}</p>${forceBtn}`;
      const fb2 = document.getElementById('force-next-btn');
      if (fb2) guardClick(fb2, () => { this.client.send({ type: MSG.FORCE_NEXT_ROUND }); });
    } else {
      // Special card names for display
      el.innerHTML = `
        <div class="mp-guess-buttons">
          <button class="btn btn-guess btn-up" data-guess="up">⬆️ Higher <kbd>U</kbd></button>
          <button class="btn btn-guess btn-equal" data-guess="equal">⚖️ Equal <kbd>E</kbd></button>
          <button class="btn btn-guess btn-down" data-guess="down">⬇️ Lower <kbd>D</kbd></button>
        </div>
        ${this.inventory.length > 0 ? `
          <div class="mp-special-cards">
            <span style="font-size:0.7rem;opacity:0.6;width:100%;text-align:center;display:block;margin-bottom:2px">Lv.${this.playerLevel} ${'⭐'.repeat(this.playerLevel)}</span>
            ${this.inventory.map(cardId => {
              const info = CARD_INFO_MAP[cardId] || { emoji: '🎴', name: cardId };
              return `<button class="btn btn-special" data-card="${cardId}">${info.emoji} ${info.name}</button>`;
            }).join('')}
          </div>
        ` : ''}
      `;

      el.querySelectorAll('.btn-special').forEach(btn => {
        btn.addEventListener('click', () => {
          const cardId = (btn as HTMLElement).dataset.card!;
          const info = CARD_INFO_MAP[cardId];
          if (this.selectedSpecialCard === cardId) {
            if (info?.targetType !== 'other') {
              this.confirmSpecialCard(cardId);
            }
          } else {
            this.selectedSpecialCard = cardId;
            this.updateSpecialCardVisuals();
            if (info?.targetType === 'other') {
              this.showTargetPicker(cardId);
            }
          }
        });
      });

      el.querySelectorAll('.btn-guess').forEach(btn => {
        guardClick(btn as HTMLElement, () => {
          if (this.selectedSpecialCard) {
            this.confirmSpecialCard(this.selectedSpecialCard);
          }
          const guess = (btn as HTMLElement).dataset.guess as 'up' | 'down' | 'equal';
          this.client.playCard(guess);
          this.hasPlayed = true;
          this.renderGame();
        });
      });
    }
  }

  private renderCard(elementId: string, card: Card | null): void {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (!card) {
      el.className = 'card-slot empty';
      el.innerHTML = '<span class="card-back">🂠</span>';
      return;
    }

    el.className = `card-slot card ${cardColor(card.suit)} flip-in`;
    el.innerHTML = `
      <span class="card-value">${card.value}</span>
      <span class="card-suit">${suitSymbol(card.suit)}</span>
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

  private cardTextFmt(card: Card | null): string {
    if (!card) return '?';
    return cardText(card);
  }

  private cardHtml(card: Card | null, size: 'small' | 'normal' = 'normal'): string {
    if (!card) return '<div class="card-placeholder">?</div>';
    return cardToHtml(card, size);
  }

  private renderRoundResult(betCard: Card | null, revealedCard: Card | null, results: any[], scores: PlayerScore[], specialEffects: any[]): void {
    const el = document.getElementById('mp-result');
    if (!el) return;

    const myResult = results.find(r => r.playerId === this.client.clientId);
    const myEffects = specialEffects.filter((e: any) => e.playerId === this.client.clientId);

    // Dead player not in results — keep previous feedback, just update scores
    if (!myResult) {
      scores.forEach(s => {
        const p = this.players.find(pl => pl.id === s.id);
        if (p) { p.score = s.score; p.alive = s.alive; }
      });
      this.renderPlayers();
      return;
    }

    // Build explanation
    const guessLabel: Record<string, string> = { up: '⬆️ HIGHER', down: '⬇️ LOWER', equal: '⚖️ EQUAL' };
    const guessText = myResult.guess ? guessLabel[myResult.guess] || myResult.guess : 'did not bet (timeout)';
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
      <div class="mp-result-card ${myResult.correct ? 'mp-result-correct' : 'mp-result-wrong'}">
        <h3>${myResult.correct ? '✅ Correct!' : myResult.eliminated ? '💀 Eliminated!' : '❌ Wrong!'}</h3>
        <div class="mp-result-explain">
          <span>You bet ${guessText}${!myResult.correct && comparison ? ` — card ${comparison}` : ''}</span>
          <div class="mp-result-cards">
            ${this.cardHtml(betCard, 'small')}
            <span class="mp-result-arrow">→</span>
            ${this.cardHtml(revealedCard, 'small')}
          </div>
          <span class="mp-result-comparison">${this.cardTextFmt(betCard)} ${comparison} to ${this.cardTextFmt(revealedCard)}</span>
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
          ? '<button id="enforce-next-btn" class="btn btn-primary" style="width:100%">Next Round ▶</button>'
          : '<p class="waiting-text">Waiting for host...</p>';
        const enBtn = document.getElementById('enforce-next-btn');
        if (enBtn) { guardClick(enBtn, () => { this.client.send({ type: MSG.FORCE_NEXT_ROUND }); }); enBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
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

    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) guardClick(playAgainBtn, () => {
      this.client.send({ type: MSG.PLAY_AGAIN });
    });

    const backLobbyBtn = document.getElementById('back-lobby-btn');
    if (backLobbyBtn) guardClick(backLobbyBtn, () => {
      this.client.leaveRoom();
      this.onLeaveRoom();
    });
  }

  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  private setupKeybindings(): void {
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    this.keyHandler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (this.hasPlayed || this.frozen || this.eliminated || this.round === 0) return;
      const key = e.key.toLowerCase();
      if (key === 'u' || key === 'arrowup') { this.client.playCard('up'); this.hasPlayed = true; this.renderGame(); }
      else if (key === 'd' || key === 'arrowdown') { this.client.playCard('down'); this.hasPlayed = true; this.renderGame(); }
      else if (key === 'e' || key === 'arrowleft' || key === 'arrowright') { this.client.playCard('equal'); this.hasPlayed = true; this.renderGame(); }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  private get state(): string { return this.round > 0 && !this.hasPlayed ? 'playing' : this.round === 0 ? 'waiting' : 'played'; }

  private createChatBubble(senderId: string, senderName: string, text: string): HTMLElement {
    const div = document.createElement('div');
    div.className = `chat-msg ${senderId === this.client.clientId ? 'chat-self' : ''}`;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'chat-name';
    nameSpan.textContent = senderName;
    div.appendChild(nameSpan);
    div.appendChild(document.createTextNode(' ' + text));
    return div;
  }

  private renderChatMessages(): void {
    const el = document.getElementById('chat-messages');
    if (!el) return;
    el.innerHTML = '';
    for (const m of this.chatMessages) {
      el.appendChild(this.createChatBubble(m.senderId, m.senderName, m.text));
    }
    el.scrollTop = el.scrollHeight;
  }

  private appendChatMessage(msg: { senderId: string; senderName: string; text: string }): void {
    const el = document.getElementById('chat-messages');
    if (!el) return;
    el.appendChild(this.createChatBubble(msg.senderId, msg.senderName, msg.text));
    el.scrollTop = el.scrollHeight;
  }
}
