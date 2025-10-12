import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface PlayerNotification {
  id: string;
  playerId: string;
  playerIp: string;
  avatarUrl: string;
  timestamp: number;
}

@customElement('player-notification')
export class PlayerNotification extends LitElement {
  @state()
  private notifications: PlayerNotification[] = [];

  @state()
  private ws: WebSocket | null = null;

  @state()
  private onlineCount: number = 1;

  static styles = css`
    :host {
      position: fixed;
      top: 60px;
      right: 0;
      z-index: 10000;
      pointer-events: none;
      display: block;
    }

    .notification {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px 0 0 12px;
      padding: 12px 16px;
      margin-bottom: 10px;
      box-shadow: -4px 4px 20px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 240px;
      animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: auto;
      transition: transform 0.2s ease;
    }

    .notification:hover {
      transform: translateX(-5px);
    }

    .notification.leaving {
      animation: slideOut 0.3s ease-out forwards;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #fff;
      border: 3px solid rgba(255, 255, 255, 0.3);
      object-fit: cover;
      flex-shrink: 0;
    }

    .info {
      flex: 1;
      color: white;
      min-width: 0;
    }

    .player-name {
      font-weight: bold;
      font-size: 0.9rem;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-status {
      font-size: 0.75rem;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @media (max-width: 480px) {
      :host {
        top: 50px;
      }

      .notification {
        min-width: 200px;
        padding: 10px 12px;
      }

      .avatar {
        width: 40px;
        height: 40px;
      }

      .player-name {
        font-size: 0.8rem;
      }

      .player-status {
        font-size: 0.7rem;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.connectWebSocket();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.ws) {
      this.ws.close();
    }
  }

  private connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('🎮 WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'welcome') {
          this.onlineCount = data.onlineCount || 1;
          console.log(`Welcome! ${this.onlineCount} player(s) online`);
        } else if (data.type === 'player-joined') {
          this.handlePlayerJoined(data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  private handlePlayerJoined(data: { playerId: string; playerIp: string; timestamp: number }) {
    // Generate a random avatar from thispersondoesnotexist.com
    // Add timestamp to prevent caching
    const avatarUrl = `https://thispersondoesnotexist.com/?${Date.now()}`;
    
    const notification: PlayerNotification = {
      id: `notif-${Date.now()}`,
      playerId: data.playerId,
      playerIp: data.playerIp,
      avatarUrl,
      timestamp: data.timestamp
    };

    this.notifications = [...this.notifications, notification];
    this.onlineCount++;

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  private removeNotification(id: string) {
    // Add leaving class for animation
    const element = this.shadowRoot?.querySelector(`[data-id="${id}"]`);
    if (element) {
      element.classList.add('leaving');
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 300);
    }
  }

  private getPlayerName(ip: string): string {
    // Generate a fun player name based on IP
    const adjectives = ['Swift', 'Mighty', 'Lucky', 'Clever', 'Bold', 'Wise', 'Quick', 'Brave'];
    const nouns = ['Gamer', 'Player', 'Champion', 'Ace', 'Pro', 'Star', 'Hero', 'Legend'];
    
    // Use IP to seed the random selection
    const ipSum = ip.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const adj = adjectives[ipSum % adjectives.length];
    const noun = nouns[(ipSum * 7) % nouns.length];
    
    return `${adj} ${noun}`;
  }

  render() {
    return html`
      ${this.notifications.map(notif => html`
        <div class="notification" data-id="${notif.id}">
          <img class="avatar" src="${notif.avatarUrl}" alt="Player avatar" @error=${(e: Event) => {
            // Fallback to a placeholder if image fails to load
            (e.target as HTMLImageElement).src = '/icon-192.png';
          }} />
          <div class="info">
            <div class="player-name">${this.getPlayerName(notif.playerIp)}</div>
            <div class="player-status">
              <span class="status-dot"></span>
              joined the game
            </div>
          </div>
        </div>
      `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'player-notification': PlayerNotification;
  }
}

