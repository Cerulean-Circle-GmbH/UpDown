/**
 * Multiplayer entry point — connects WebSocket, shows Lobby, transitions to Game
 */

import { WebSocketClient } from './WebSocketClient.js';
import { LobbyUI } from './LobbyUI.js';
import { MultiplayerUI } from './MultiplayerUI.js';

const client = new WebSocketClient();
const container = document.getElementById('app')!;

const lobby = new LobbyUI(client, container, (roomId) => {
  lobby.hide();
  game.show(roomId);
});

const game = new MultiplayerUI(client, container, () => {
  game.hide();
  lobby.show();
});

// Fetch server config for share URLs
async function loadConfig(): Promise<{ baseDomain: string; httpsPort: number }> {
  try {
    const res = await fetch('/api/config');
    return await res.json();
  } catch {
    return { baseDomain: location.hostname, httpsPort: parseInt(location.port) || 3443 };
  }
}

async function init() {
  try {
    const config = await loadConfig();
    const shareBase = `https://${config.baseDomain}:${config.httpsPort}`;
    (window as any).__shareBase = shareBase;
    await client.connect();
    console.log(`🎴 Connected — share base: ${shareBase}`);
    lobby.show();
  } catch (e) {
    container.innerHTML = '<div class="error"><h2>Connection Failed</h2><p>Could not connect to server. Please refresh.</p></div>';
  }
}

init();
