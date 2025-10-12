import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface PlayerNotification {
  id: string;
  playerId: string;
  playerIp: string;
  avatarUrl: string;
  timestamp: number;
}

interface Player {
  playerId: string;
  playerIp: string;
  avatarUrl: string;
  connectedAt: number;
}

@customElement('player-notification')
export class PlayerNotification extends LitElement {
  @state()
  private notifications: PlayerNotification[] = [];

  @state()
  private players: Player[] = [];

  @state()
  private ws: WebSocket | null = null;

  @state()
  private onlineCount: number = 1;

  @state()
  private dockVisible: boolean = false;

  static styles = css`
    :host {
      display: block;
    }

    .notifications-container {
      position: fixed;
      top: 60px;
      right: 0;
      z-index: 10000;
      pointer-events: none;
    }

    .player-dock {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 80px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 2px 0 20px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      overflow-y: auto;
      overflow-x: hidden;
      transform: translateX(-100%);
      transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: auto;
    }

    .player-dock.visible {
      transform: translateX(0);
    }

    .player-dock::-webkit-scrollbar {
      width: 4px;
    }

    .player-dock::-webkit-scrollbar-track {
      background: transparent;
    }

    .player-dock::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 2px;
    }

    .dock-player {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 3px solid rgba(102, 126, 234, 0.3);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      flex-shrink: 0;
      animation: dockSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes dockSlideIn {
      from {
        transform: translateX(-100px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .dock-player:hover {
      transform: scale(1.15) translateY(-5px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    .dock-player img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dock-player-status {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      background: #4ade80;
      border: 2px solid white;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    .dock-toggle {
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 80px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 0 12px 12px 0;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      pointer-events: auto;
      font-size: 1.2rem;
    }

    .dock-toggle:hover {
      width: 32px;
      background: rgba(102, 126, 234, 0.9);
      color: white;
    }

    .dock-toggle.hidden {
      transform: translateY(-50%) translateX(-100%);
    }

    .dock-player-tooltip {
      position: absolute;
      left: 70px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 10001;
    }

    .dock-player:hover .dock-player-tooltip {
      opacity: 1;
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
          
          // Initialize players list
          if (data.players && Array.isArray(data.players)) {
            this.players = data.players.map((p: any) => ({
              ...p,
              avatarUrl: this.generateUniqueAvatar(p.playerId)
            }));
            
            // Show dock if there are other players
            if (this.players.length > 1) {
              setTimeout(() => {
                this.dockVisible = true;
              }, 500);
            }
          }
        } else if (data.type === 'player-joined') {
          this.handlePlayerJoined(data);
        } else if (data.type === 'player-left') {
          this.handlePlayerLeft(data);
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

  private generateUniqueAvatar(playerId: string): string {
    // Use DiceBear API to generate unique, fun avatars based on player ID
    // Available styles: adventurer, avataaars, big-ears, bottts, fun-emoji, lorelei, micah, personas
    const styles = ['adventurer', 'avataaars', 'big-ears', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'personas'];
    
    // Pick a style based on player ID for variety
    const styleIndex = playerId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const style = styles[styleIndex % styles.length];
    
    // Use player ID as seed to ensure same player always gets same avatar
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(playerId)}`;
  }

  private handlePlayerJoined(data: { playerId: string; playerIp: string; timestamp: number }) {
    // Generate a unique avatar based on player ID
    const avatarUrl = this.generateUniqueAvatar(data.playerId);
    
    // Add to players list
    const player: Player = {
      playerId: data.playerId,
      playerIp: data.playerIp,
      avatarUrl,
      connectedAt: data.timestamp
    };
    
    this.players = [...this.players, player];
    
    // Show dock if there are multiple players
    if (this.players.length > 1 && !this.dockVisible) {
      setTimeout(() => {
        this.dockVisible = true;
      }, 500);
    }
    
    // Show notification
    const notification: PlayerNotification = {
      id: `notif-${Date.now()}`,
      playerId: data.playerId,
      playerIp: data.playerIp,
      avatarUrl,
      timestamp: data.timestamp
    };

    this.notifications = [...this.notifications, notification];
    this.onlineCount++;

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  private handlePlayerLeft(data: { playerId: string; timestamp: number }) {
    // Remove from players list
    this.players = this.players.filter(p => p.playerId !== data.playerId);
    this.onlineCount--;
    
    // Hide dock if only one player left (yourself)
    if (this.players.length <= 1) {
      this.dockVisible = false;
    }
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

  private toggleDock() {
    this.dockVisible = !this.dockVisible;
  }

  render() {
    return html`
      <!-- macOS Dock-style player sidebar -->
      <div class="player-dock ${this.dockVisible ? 'visible' : ''}">
        ${this.players.map(player => html`
          <div class="dock-player" title="${this.getPlayerName(player.playerIp)}">
            <img 
              src="${player.avatarUrl}" 
              alt="${this.getPlayerName(player.playerIp)}"
              @error=${(e: Event) => {
                (e.target as HTMLImageElement).src = '/icon-192.png';
              }}
            />
            <span class="dock-player-status"></span>
            <div class="dock-player-tooltip">${this.getPlayerName(player.playerIp)}</div>
          </div>
        `)}
      </div>

      <!-- Dock toggle button -->
      ${this.players.length > 1 ? html`
        <div class="dock-toggle ${this.dockVisible ? 'hidden' : ''}" @click=${this.toggleDock}>
          👥
        </div>
      ` : ''}

      <!-- Notifications (slide in from right) -->
      <div class="notifications-container">
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
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'player-notification': PlayerNotification;
  }
}

