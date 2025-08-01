import { GameModel } from '../shared/GameModel.js';
import { Player } from '../shared/Player.js';
import { Lobby } from '../shared/Lobby.js';
import { Card } from '../shared/Card.js';

console.log('Server booting...');

// Example: create a default game model and log its scenario
const game = new GameModel();
console.log('Serialized scenario:', game.serializeScenario());

// Check if Bun is available, otherwise use fallback
try {
  // Try to import Bun's serve function
  const { serve } = await import('bun');
  
  // Set up Bun HTTP/WebSocket server and scenario sync logic
  serve({
    websocket: {
      open(ws: any) {
        console.log('WebSocket connection opened');
      },
      message(ws: any, message: any) {
        // TODO: Parse and handle incoming scenario sync messages
        ws.send('pong'); // Example response
      },
      close(ws: any) {
        console.log('WebSocket connection closed');
      }
    },
    fetch(req: any) {
      return new Response('UpDown server running!', { status: 200 });
    },
    port: 3000,
  });
  console.log('Server running on port 3000 with Bun');
} catch (error) {
  console.log('Bun not available, running in basic mode');
  console.log('Game model initialized successfully');
  console.log('WebSocket server would run on port 3000');
  
  // Create some example game objects to demonstrate functionality
  const player1 = new Player();
  const player2 = new Player();
  const lobby = new Lobby();
  const card = new Card();
  
  console.log('Example objects created:');
  console.log('- GameModel:', game.serializeScenario());
  console.log('- Players initialized');
  console.log('- Lobby initialized');
  console.log('- Card initialized');
}
