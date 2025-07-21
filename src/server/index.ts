import { GameModel } from '../shared/GameModel';
import { Player } from '../shared/Player';
import { Lobby } from '../shared/Lobby';
import { Card } from '../shared/Card';
import { serve } from 'bun';

console.log('Server booting...');

// Example: create a default game model and log its scenario
const game = new GameModel();
console.log('Serialized scenario:', game.serializeScenario());

// Set up Bun HTTP/WebSocket server and scenario sync logic
serve({
  websocket: {
    open(ws) {
      console.log('WebSocket connection opened');
    },
    message(ws, message) {
      // TODO: Parse and handle incoming scenario sync messages
      ws.send('pong'); // Example response
    },
    close(ws) {
      console.log('WebSocket connection closed');
    }
  },
  fetch(req) {
    return new Response('UpDown server running!', { status: 200 });
  },
  port: 3000,
});
