import { MSG } from '../../shared/MessageTypes.js';
/**
 * WebSocketClient — Handles WebSocket connection and game protocol
 * QnD Sprint 3: Simple event-based client for multiplayer
 */

type MessageHandler = (msg: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  clientId: string = '';
  connected: boolean = false;
  readonly playerToken: string;

  constructor() {
    let token = localStorage.getItem('updown-player-id');
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem('updown-player-id', token);
    }
    this.playerToken = token;
  }

  // [uc:uuid:92a061e0] UC-C1: connection.open
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${location.host}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.connected = true;
        resolve();
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.emit('disconnected', {});
      };

      this.ws.onerror = () => reject(new Error('WebSocket connection failed'));

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'welcome') {
            this.clientId = msg.clientId;
            this.send({
              type: MSG.IDENTIFY,
              playerToken: this.playerToken,
              name: localStorage.getItem('updown-name') || '',
              avatar: localStorage.getItem('updown-avatar') || localStorage.getItem('updown-avatar-card') || '',
              phone: localStorage.getItem('updown-phone') || '',
              url: localStorage.getItem('updown-url') || '',
              screenWidth: screen.width,
              screenHeight: screen.height,
              platform: navigator.platform,
            });
          }
          this.emit(msg.type, msg);
        } catch {}
      };
    });
  }

  async reconnect(): Promise<void> {
    if (this.ws) { try { this.ws.close(); } catch {} }
    this.ws = null;
    this.connected = false;
    this.emit('reconnecting', {});
    await this.connect();
    this.emit('reconnected', {});
  }

  send(msg: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
  }

  off(type: string, handler?: MessageHandler): void {
    if (!handler) { this.handlers.delete(type); return; }
    const list = this.handlers.get(type);
    if (list) this.handlers.set(type, list.filter(h => h !== handler));
  }

  private emit(type: string, msg: any): void {
    const handlers = this.handlers.get(type);
    if (handlers) handlers.forEach(h => h(msg));
  }

  private clientAvatarUrl(): string {
    return localStorage.getItem('updown-avatar') || '';
  }

  // [uc:uuid:fbfed148] UC-R2: room.create — [uc:uuid:1c21171d] UC-R3: room.create.private
  createRoom(name: string, playerName: string, maxPlayers?: number, roomKey?: string): void {
    this.send({ type: MSG.CREATE_ROOM, roomName: name, playerName, maxPlayers, roomKey, playerToken: this.playerToken, clientAvatar: this.clientAvatarUrl() });
  }

  // [uc:uuid:9cc60247] UC-R4: room.join — [uc:uuid:61449e82] UC-R5: room.join.private.correct — [uc:uuid:148f2e73] UC-R6: room.join.private.wrong
  joinRoom(roomId: string, playerName: string, roomKey?: string): void {
    this.send({ type: MSG.JOIN_ROOM, roomId, playerName, roomKey, playerToken: this.playerToken, clientAvatar: this.clientAvatarUrl() });
  }

  // [uc:uuid:96f2ecd5] UC-R10: room.leave
  leaveRoom(): void {
    this.send({ type: MSG.LEAVE_ROOM });
  }

  // [uc:uuid:7cd55a0b] UC-R1: rooms.list
  listRooms(): void {
    this.send({ type: MSG.LIST_ROOMS });
  }

  // [uc:uuid:560d9a46] UC-G1: game.start
  startGame(): void {
    this.send({ type: MSG.START_GAME });
  }

  // [uc:uuid:f0295f28] UC-P1: player.guess.up — [uc:uuid:c9866c6e] UC-P2: down — [uc:uuid:fa8f1c83] UC-P3: equal
  playCard(guess: 'up' | 'down' | 'equal'): void {
    this.send({ type: MSG.PLAY_CARD, guess });
  }

  // [uc:uuid:f43897d5] UC-P9: player.playSpecial
  playSpecial(cardId: string, targetPlayerId?: string): void {
    this.send({ type: MSG.PLAY_SPECIAL, cardId, targetPlayerId });
  }

  addBot(personality?: string): void {
    this.send({ type: MSG.ADD_BOT, personality });
  }

  spectateRoom(roomId: string, playerName: string): void {
    this.send({ type: MSG.SPECTATE, roomId, playerName });
  }

  leaveSpectate(): void {
    this.send({ type: MSG.LEAVE_SPECTATE });
  }

  joinNextGame(playerName: string): void {
    this.send({ type: MSG.JOIN_NEXT_GAME, playerName });
  }

  sendChat(text: string): void {
    this.send({ type: MSG.CHAT_MESSAGE, text });
  }
}

export function guardClick(btn: HTMLElement, action: () => void | Promise<void>): void {
  btn.addEventListener('click', async () => {
    if ((btn as HTMLButtonElement).disabled) return;
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add('loading');
    try { await action(); } finally {
      (btn as HTMLButtonElement).disabled = false;
      btn.classList.remove('loading');
    }
  });
}

export function generateInviteMessage(url: string, roomName?: string): { title: string; text: string; clipboardText: string } {
  const suffix = roomName ? ` : ${roomName}` : '';
  return {
    title: `🎴 UpDown — Higher or Lower?${suffix}`,
    text: `🎴 Hey! Come play UpDown with me! Can you beat the odds? 🃏\nGuess higher, lower or equal — outlast everyone at the table! 🔥${suffix}`,
    clipboardText: `🎴 Hey! Come play UpDown with me! Can you beat the odds? 🃏\n\nJoin here: ${url}${suffix}`
  };
}

export async function shareOrCopy(url: string, feedbackEl?: HTMLElement, roomName?: string): Promise<void> {
  const invite = generateInviteMessage(url, roomName);
  if (navigator.share) {
    try { await navigator.share({ title: invite.title, text: invite.text, url }); } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(invite.clipboardText);
    } catch {
      prompt('Copy this link:', url);
      return;
    }
  }
  if (feedbackEl) {
    const orig = feedbackEl.textContent;
    feedbackEl.textContent = '✅ Shared!';
    setTimeout(() => { feedbackEl.textContent = orig; }, 2000);
  }
}
