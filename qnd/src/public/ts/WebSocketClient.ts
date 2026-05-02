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
          }
          this.emit(msg.type, msg);
        } catch {}
      };
    });
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

  private emit(type: string, msg: any): void {
    const handlers = this.handlers.get(type);
    if (handlers) handlers.forEach(h => h(msg));
  }

  createRoom(name: string, playerName: string, maxPlayers?: number, roomKey?: string): void {
    this.send({ type: 'CREATE_ROOM', roomName: name, playerName, maxPlayers, roomKey });
  }

  joinRoom(roomId: string, playerName: string, roomKey?: string): void {
    this.send({ type: 'JOIN_ROOM', roomId, playerName, roomKey });
  }

  leaveRoom(): void {
    this.send({ type: 'LEAVE_ROOM' });
  }

  listRooms(): void {
    this.send({ type: 'LIST_ROOMS' });
  }

  startGame(): void {
    this.send({ type: 'START_GAME' });
  }

  playCard(guess: 'up' | 'down' | 'equal'): void {
    this.send({ type: 'PLAY_CARD', guess });
  }

  playSpecial(cardId: string, targetPlayerId?: string): void {
    this.send({ type: 'PLAY_SPECIAL', cardId, targetPlayerId });
  }

  addBot(personality?: string): void {
    this.send({ type: 'ADD_BOT', personality });
  }

  spectateRoom(roomId: string, playerName: string): void {
    this.send({ type: 'SPECTATE', roomId, playerName });
  }

  leaveSpectate(): void {
    this.send({ type: 'LEAVE_SPECTATE' });
  }

  joinNextGame(playerName: string): void {
    this.send({ type: 'JOIN_NEXT_GAME', playerName });
  }

  sendChat(text: string): void {
    this.send({ type: 'CHAT_MESSAGE', text });
  }
}

export function generateInviteMessage(url: string): { title: string; text: string; clipboardText: string } {
  return {
    title: '🎴 UpDown — Higher or Lower?',
    text: '🎴 Hey! Come play UpDown with me! Can you beat the odds? 🃏\nGuess higher, lower or equal — outlast everyone at the table! 🔥',
    clipboardText: `🎴 Hey! Come play UpDown with me! Can you beat the odds? 🃏\n\nJoin here: ${url}`
  };
}

export async function shareOrCopy(url: string, feedbackEl?: HTMLElement): Promise<void> {
  const invite = generateInviteMessage(url);
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
