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

async function init() {
  try {
    await client.connect();
    console.log('🎴 Connected to UpDown server');
    lobby.show();
  } catch (e) {
    container.innerHTML = '<div class="error"><h2>Connection Failed</h2><p>Could not connect to server. Please refresh.</p></div>';
  }
}

init();
