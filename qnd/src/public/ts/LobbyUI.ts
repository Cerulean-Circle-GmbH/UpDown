/**
 * LobbyUI — Lobby screen: list rooms, create room, join room
 * QnD Sprint 3: Vanilla DOM, no framework
 */

import { WebSocketClient, shareOrCopy, guardClick } from './WebSocketClient.js';
import { MSG } from '../../shared/MessageTypes.js';
import { renderHeader } from './components/Header.js';

interface RoomInfo {
  id: string; name: string; playerCount: number; maxPlayers: number;
  isPrivate: boolean; state: string; round: number;
}

export class LobbyUI {
  private client: WebSocketClient;
  private container: HTMLElement;
  private rooms: RoomInfo[] = [];
  private playerName: string = '';
  private onEnterRoom: (roomId: string) => void;

  constructor(client: WebSocketClient, container: HTMLElement, onEnterRoom: (roomId: string) => void) {
    this.client = client;
    this.container = container;
    this.onEnterRoom = onEnterRoom;

    const params = new URLSearchParams(window.location.search);
    this.playerName = params.get('name') || localStorage.getItem('updown-name') || `Player ${Math.floor(Math.random() * 1000)}`;

    this.client.on(MSG.ROOM_LIST, (msg) => { this.rooms = msg.rooms; this.renderRoomList(); });
    this.client.on(MSG.ROOM_JOINED, (msg) => { this.onEnterRoom(msg.room.id); });
    this.client.on(MSG.ERROR, (msg) => { this.showError(msg.message); });
    this.client.on(MSG.PROFILE, (msg: any) => {
      if (msg.profile?.secretCode) {
        const el = document.getElementById('profile-secret-code') as HTMLInputElement;
        if (el && !el.value) el.value = msg.profile.secretCode;
      }
    });
    this.client.on(MSG.SECRET_CODE_OK, (msg: any) => {
      const el = document.getElementById('profile-code-status');
      if (el) { el.textContent = '✅ Saved'; el.style.color = '#4CAF50'; }
    });
    this.client.on(MSG.SECRET_CODE_FAILED, (msg: any) => {
      const el = document.getElementById('profile-code-status');
      if (el) { el.textContent = '❌ ' + msg.reason; el.style.color = '#e74c3c'; }
    });

    // On WS connect: auto-load rooms, auto-join if ?join= param
    const joinId = params.get('join');
    const joinKey = params.get('key') || undefined;
    this.client.on('welcome', () => {
      this.client.listRooms();
      if (joinId) {
        this.client.joinRoom(joinId, this.playerName, joinKey);
      }
    });
  }

  show(): void {
    this.render();
    this.client.listRooms();
  }

  hide(): void {
    this.container.innerHTML = '';
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="game-container">
      <header class="game-header" style="position:relative">
        <h1>🎴 UpDown</h1>
        <div style="position:absolute;right:2px;top:50%;transform:translateY(-50%);display:flex;gap:0;z-index:10">
          <a id="home-btn" href="/" style="color:white;font-size:0.9rem;opacity:0.5;padding:10px;text-decoration:none;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center">🏠</a>
          <button id="fullscreen-btn" style="background:none;border:none;color:white;font-size:0.9rem;opacity:0.5;padding:10px;cursor:pointer;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center">⛶</button>
        </div>
      </header>
      <main class="lobby">

        <div class="lobby-name">
          <label>Your Name</label>
          <div class="lobby-name-row">
            <input type="text" id="player-name" value="${this.playerName}" maxlength="20" placeholder="Enter name...">
            <button id="edit-profile-btn" class="btn btn-small" style="flex-shrink:0">✏️</button>
            <a href="/profile" class="btn btn-small" style="flex-shrink:0;text-decoration:none">👤</a>
          </div>
        </div>

        <div id="profile-panel" class="profile-panel" style="display:none">
          <div class="profile-panel-content">
            <div class="profile-panel-header">
              <h3>Edit Profile</h3>
              <button id="profile-close" class="btn btn-small">✕</button>
            </div>
            <div class="profile-avatar-preview" id="profile-avatar-preview"></div>
            <label>Name</label>
            <input type="text" id="profile-name" value="${this.playerName}" maxlength="20">
            <label>Phone</label>
            <input type="tel" id="profile-phone" value="${localStorage.getItem('updown-phone') || ''}" placeholder="Phone number...">
            <label>URL</label>
            <input type="url" id="profile-url" value="${localStorage.getItem('updown-url') || ''}" placeholder="Website or social link...">
            <label>Avatar</label>
            <div class="profile-avatar-options">
              <input type="file" id="profile-avatar-upload" accept="image/*" style="display:none">
              <button id="profile-avatar-btn" class="btn btn-small">📷 Upload</button>
              <span class="profile-avatar-or">or pick a card:</span>
            </div>
            <div class="card-picker-row">
              <div class="card-picker-scroll card-picker-suits" id="suit-picker">
                ${['♠','♥','♦','♣'].map(s => `<span class="card-picker-item card-suit-item${s === '♥' || s === '♦' ? ' suit-red' : ''}" data-suit="${s}">${s}</span>`).join('')}
              </div>
              <div class="card-picker-scroll card-picker-values" id="value-picker">
                ${['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(v => `<span class="card-picker-item card-value-item" data-value="${v}">${v}</span>`).join('')}
              </div>
            </div>
            <label>🔑 Secret Code (4 digits)</label>
            <div style="display:flex;gap:6px;align-items:center">
              <input type="text" id="profile-secret-code" maxlength="4" pattern="[0-9]{4}" placeholder="----" style="width:80px;text-align:center;font-size:1.2rem;font-weight:700;letter-spacing:4px">
              <span id="profile-code-status" style="font-size:0.75rem"></span>
            </div>
            <button id="profile-save" class="btn btn-primary" style="width:100%;margin-top:8px">Save</button>
          </div>
        </div>

        <div class="lobby-actions">
          <button id="create-room-btn" class="btn btn-primary">🏠 Create Room</button>
          <button id="refresh-rooms-btn" class="btn btn-secondary">🔄 Refresh</button>
          <button id="leaderboard-btn" class="btn btn-secondary">🏆</button>
        </div>

        <div class="lobby-create-form" id="create-form" style="display:none">
          <input type="text" id="room-name" placeholder="Room name..." value="${this.playerName}'s Room">
          <input type="text" id="room-key" placeholder="Private key (optional)">
          <div class="lobby-create-actions">
            <button id="confirm-create-btn" class="btn btn-primary">Create</button>
            <button id="cancel-create-btn" class="btn btn-secondary">Cancel</button>
          </div>
        </div>

        <div class="lobby-rooms" id="room-list">
          <p class="loading">Loading rooms...</p>
        </div>

        <div class="lobby-join-private">
          <input type="text" id="join-room-id" placeholder="Room ID">
          <input type="text" id="join-room-key" placeholder="Key (if private)">
          <button id="join-private-btn" class="btn btn-small">Join Private</button>
        </div>

        <div id="lobby-error" class="lobby-error" style="display:none"></div>

        <div class="lobby-rapid">
          <button id="rapid-mode-btn" class="btn btn-rapid">⚡ Rapid Mode (Solo)</button>
        </div>
      </main>
      </div>
    `;

    // Header click — left for reload
    const header = this.container.querySelector('.game-header');
    if (header) {
      header.addEventListener('click', (e: Event) => {
        const rect = (header as HTMLElement).getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left;
        if (x < 50) { history.replaceState({}, '', '/mp'); location.reload(); }
      });
    }

    document.getElementById('fullscreen-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else { document.documentElement.requestFullscreen().catch(() => {}); }
    });

    this.setupEvents();
  }

  private setupEvents(): void {
    const nameInput = document.getElementById('player-name') as HTMLInputElement;
    const saveName = () => {
      this.playerName = nameInput.value.trim() || 'Player';
      localStorage.setItem('updown-name', this.playerName);
    };
    nameInput?.addEventListener('input', saveName);
    nameInput?.addEventListener('change', saveName);

    // Profile panel
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      const profileNameInput = document.getElementById('profile-name') as HTMLInputElement;
      if (profileNameInput) profileNameInput.value = this.playerName;
      this.refreshAvatarPreview();
      document.getElementById('profile-panel')!.style.display = 'flex';
    });
    document.getElementById('profile-close')?.addEventListener('click', () => {
      document.getElementById('profile-panel')!.style.display = 'none';
    });
    document.getElementById('profile-avatar-btn')?.addEventListener('click', () => {
      document.getElementById('profile-avatar-upload')?.click();
    });
    document.getElementById('profile-avatar-upload')?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        try {
          localStorage.setItem('updown-avatar', dataUrl);
          localStorage.removeItem('updown-avatar-card');
        } catch {
          alert('Photo too large. Try a smaller image.');
          return;
        }
        this.refreshAvatarPreview();
      };
      reader.readAsDataURL(file);
    });
    // Suit + value card pickers
    const savedCard = localStorage.getItem('updown-avatar-card') || '';
    const savedSuit = savedCard.slice(-1);
    const savedValue = savedCard.slice(0, -1);
    const updateCardFromPickers = () => {
      const suit = document.querySelector('.card-suit-item.selected')?.getAttribute('data-suit') || '';
      const value = document.querySelector('.card-value-item.selected')?.getAttribute('data-value') || '';
      if (suit && value) {
        localStorage.setItem('updown-avatar-card', value + suit);
        localStorage.removeItem('updown-avatar');
        this.refreshAvatarPreview();
      }
    };
    document.querySelectorAll('.card-suit-item').forEach(el => {
      if ((el as HTMLElement).dataset.suit === savedSuit) el.classList.add('selected');
      el.addEventListener('click', () => {
        document.querySelectorAll('.card-suit-item').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        updateCardFromPickers();
      });
    });
    document.querySelectorAll('.card-value-item').forEach(el => {
      if ((el as HTMLElement).dataset.value === savedValue) el.classList.add('selected');
      el.addEventListener('click', () => {
        document.querySelectorAll('.card-value-item').forEach(v => v.classList.remove('selected'));
        el.classList.add('selected');
        updateCardFromPickers();
      });
    });
    const profileSaveBtn = document.getElementById('profile-save');
    if (profileSaveBtn) guardClick(profileSaveBtn, () => {
      const name = (document.getElementById('profile-name') as HTMLInputElement).value.trim();
      const phone = (document.getElementById('profile-phone') as HTMLInputElement).value.trim();
      const url = (document.getElementById('profile-url') as HTMLInputElement).value.trim();
      if (name) { this.playerName = name; localStorage.setItem('updown-name', name); (document.getElementById('player-name') as HTMLInputElement).value = name; }
      if (phone) localStorage.setItem('updown-phone', phone);
      if (url) localStorage.setItem('updown-url', url);
      const code = (document.getElementById('profile-secret-code') as HTMLInputElement)?.value.trim();
      if (code && /^\d{4}$/.test(code)) {
        this.client.send({ type: MSG.UPDATE_SECRET_CODE, code });
      }
      document.getElementById('profile-panel')!.style.display = 'none';
    });

    document.getElementById('create-room-btn')?.addEventListener('click', () => {
      const roomNameInput = document.getElementById('room-name') as HTMLInputElement;
      if (roomNameInput) roomNameInput.value = `${this.playerName}'s Room`;
      document.getElementById('create-form')!.style.display = 'block';
    });

    document.getElementById('cancel-create-btn')?.addEventListener('click', () => {
      document.getElementById('create-form')!.style.display = 'none';
    });

    const createBtn = document.getElementById('confirm-create-btn');
    if (createBtn) guardClick(createBtn, () => {
      const name = (document.getElementById('room-name') as HTMLInputElement).value.trim();
      const key = (document.getElementById('room-key') as HTMLInputElement).value || undefined;
      this.client.createRoom(name, this.playerName, 10, key);
      return this.client.waitFor(MSG.ROOM_JOINED, MSG.ERROR);
    });

    const refreshBtn = document.getElementById('refresh-rooms-btn');
    if (refreshBtn) guardClick(refreshBtn, () => { this.client.listRooms(); });

    document.getElementById('leaderboard-btn')?.addEventListener('click', () => {
      window.location.href = '/leaderboard';
    });

    const joinPrivateBtn = document.getElementById('join-private-btn');
    if (joinPrivateBtn) guardClick(joinPrivateBtn, () => {
      const roomId = (document.getElementById('join-room-id') as HTMLInputElement).value;
      const key = (document.getElementById('join-room-key') as HTMLInputElement).value || undefined;
      if (!roomId) return;
      this.client.joinRoom(roomId, this.playerName, key);
      return this.client.waitFor(MSG.ROOM_JOINED, MSG.ERROR);
    });

    document.getElementById('rapid-mode-btn')?.addEventListener('click', () => {
      window.location.href = '/js';
    });
  }

  private renderRoomList(): void {
    const list = document.getElementById('room-list');
    if (!list) return;

    if (this.rooms.length === 0) {
      list.innerHTML = '<p class="no-rooms">No rooms available. Create one!</p>';
      return;
    }

    list.innerHTML = this.rooms.map((room: any) => {
      const waiting = room.autoStart && room.state === 'waiting';
      const need = waiting ? Math.max(0, (room.minPlayers || 1) - room.playerCount) : 0;
      const stateText = waiting && need > 0
        ? `⏳ Need ${need} more`
        : room.state === 'waiting' ? '⏳ Waiting'
        : room.state === 'finished' ? '🏁 Finished'
        : `🎮 Round ${room.round}`;
      return `
        <div class="room-card" data-room-id="${room.id}">
          <div class="room-info">
            <span class="room-name">${room.isPrivate ? '🔒 ' : ''}${room.name}</span>
            <span class="room-players">${room.playerCount}/${room.maxPlayers} players</span>
          </div>
          <div class="room-status">
            <span class="room-state">${stateText}</span>
            <button class="btn btn-share" data-room="${room.id}" data-key="${room.roomKey || ''}" data-name="${room.name}" title="Copy join link">🔗</button>
            ${room.state === 'waiting'
              ? `<button class="btn btn-join" data-room="${room.id}">Join</button>`
              : room.state === 'finished'
                ? `<button class="btn btn-remove" data-room="${room.id}">🗑</button>`
                : `<button class="btn btn-spectate" data-room="${room.id}">👁️ Watch</button>`
            }
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.btn-join').forEach(btn => {
      guardClick(btn as HTMLElement, () => {
        const roomId = (btn as HTMLElement).dataset.room!;
        this.client.joinRoom(roomId, this.playerName);
        return this.client.waitFor(MSG.ROOM_JOINED, MSG.ERROR);
      });
    });

    list.querySelectorAll('.btn-spectate').forEach(btn => {
      guardClick(btn as HTMLElement, () => {
        const roomId = (btn as HTMLElement).dataset.room!;
        this.client.spectateRoom(roomId, this.playerName);
        this.onEnterRoom(roomId);
      });
    });

    list.querySelectorAll('.btn-remove').forEach(btn => {
      guardClick(btn as HTMLElement, () => {
        const roomId = (btn as HTMLElement).dataset.room!;
        this.client.send({ type: MSG.REMOVE_ROOM, roomId });
      });
    });

    list.querySelectorAll('.btn-share').forEach(btn => {
      guardClick(btn as HTMLElement, async () => {
        const roomId = (btn as HTMLElement).dataset.room!;
        const key = (btn as HTMLElement).dataset.key || '';
        const base = (window as any).__shareBase || location.origin;
        const url = `${base}/mp?join=${roomId}${key ? `&key=${encodeURIComponent(key)}` : ''}`;
        await shareOrCopy(url, btn as HTMLElement, (btn as HTMLElement).dataset.name);
      });
    });
  }

  private avatarPreviewHtml(): string {
    const img = localStorage.getItem('updown-avatar');
    if (img) return `<img src="${img}" width="64" height="64" style="border-radius:50%">`;
    const card = localStorage.getItem('updown-avatar-card');
    if (card) return `<span class="card-avatar-large">${card}</span>`;
    const name = localStorage.getItem('updown-name') || this.playerName || 'P';
    const initials = name.slice(0, 2).toUpperCase();
    const hue = name.charCodeAt(0) * 37 % 360;
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:hsl(${hue},55%,45%);color:white;font-size:1.5rem;font-weight:700">${initials}</span>`;
  }

  private refreshAvatarPreview(): void {
    const el = document.getElementById('profile-avatar-preview');
    if (el) el.innerHTML = this.avatarPreviewHtml();
  }



  private showError(message: string): void {
    const el = document.getElementById('lobby-error');
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 3000);
    }
  }
}
