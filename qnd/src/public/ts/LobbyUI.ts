/**
 * LobbyUI — Lobby screen: list rooms, create room, join room
 * QnD Sprint 3: Vanilla DOM, no framework
 */

import { WebSocketClient } from './WebSocketClient.js';

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

    this.client.on('ROOM_LIST', (msg) => { this.rooms = msg.rooms; this.renderRoomList(); });
    this.client.on('ROOM_JOINED', (msg) => { this.onEnterRoom(msg.room.id); });
    this.client.on('ERROR', (msg) => { this.showError(msg.message); });

    // Auto-join if ?join= param present
    const joinId = params.get('join');
    if (joinId) {
      this.client.on('welcome', () => {
        this.client.joinRoom(joinId, this.playerName);
      });
    }
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
      <div class="lobby">
        <div class="lobby-header">
          <h1>🎴 UpDown</h1>
          <p class="lobby-subtitle">Multiplayer Card Game</p>
        </div>

        <div class="lobby-name">
          <label>Your Name</label>
          <input type="text" id="player-name" value="${this.playerName}" maxlength="20" placeholder="Enter name...">
        </div>

        <div class="lobby-actions">
          <button id="create-room-btn" class="btn btn-primary">🏠 Create Room</button>
          <button id="refresh-rooms-btn" class="btn btn-secondary">🔄 Refresh</button>
        </div>

        <div class="lobby-create-form" id="create-form" style="display:none">
          <input type="text" id="room-name" placeholder="Room name..." value="Game Room">
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
      </div>
    `;

    this.setupEvents();
  }

  private setupEvents(): void {
    const nameInput = document.getElementById('player-name') as HTMLInputElement;
    nameInput?.addEventListener('change', () => {
      this.playerName = nameInput.value.trim() || 'Player';
      localStorage.setItem('updown-name', this.playerName);
    });

    document.getElementById('create-room-btn')?.addEventListener('click', () => {
      document.getElementById('create-form')!.style.display = 'block';
    });

    document.getElementById('cancel-create-btn')?.addEventListener('click', () => {
      document.getElementById('create-form')!.style.display = 'none';
    });

    document.getElementById('confirm-create-btn')?.addEventListener('click', () => {
      const name = (document.getElementById('room-name') as HTMLInputElement).value || 'Game Room';
      const key = (document.getElementById('room-key') as HTMLInputElement).value || undefined;
      this.client.createRoom(name, this.playerName, 10, key);
    });

    document.getElementById('refresh-rooms-btn')?.addEventListener('click', () => {
      this.client.listRooms();
    });

    document.getElementById('join-private-btn')?.addEventListener('click', () => {
      const roomId = (document.getElementById('join-room-id') as HTMLInputElement).value;
      const key = (document.getElementById('join-room-key') as HTMLInputElement).value || undefined;
      if (roomId) this.client.joinRoom(roomId, this.playerName, key);
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
            <button class="btn btn-join" data-room="${room.id}">${room.state === 'waiting' ? 'Join' : 'Spectate'}</button>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.btn-join').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = (btn as HTMLElement).dataset.room!;
        this.client.joinRoom(roomId, this.playerName);
      });
    });
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
