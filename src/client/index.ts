// Basic client implementation for UpDown game
import { GameModel } from '../shared/GameModel.js';
import { Player } from '../shared/Player.js';
import { Lobby } from '../shared/Lobby.js';
import { CardType } from '../shared/Card.js';

console.log('UpDown Client starting...');

// Simulate a client-side game session
class UpDownClient {
  private gameModel: GameModel;
  private currentPlayer: Player | null;
  private currentLobby: Lobby | null;

  constructor() {
    this.gameModel = new GameModel();
    this.currentPlayer = null;
    this.currentLobby = null;
  }

  // Create a new player and join a lobby
  joinGame(playerName: string): void {
    this.currentPlayer = new Player(undefined, playerName);
    console.log(`Player ${playerName} created with ID: ${this.currentPlayer.id}`);
    
    // Create or join a lobby
    const availableLobbies = this.gameModel.getAvailableLobbies();
    
    if (availableLobbies.length > 0) {
      // Join existing lobby
      this.currentLobby = availableLobbies[0];
      this.gameModel.joinLobby(this.currentLobby.id, this.currentPlayer);
      console.log(`Joined existing lobby: ${this.currentLobby.id}`);
    } else {
      // Create new lobby
      this.currentLobby = this.gameModel.createLobby(this.currentPlayer);
      console.log(`Created new lobby: ${this.currentLobby.id}`);
    }
    
    this.displayLobbyStatus();
  }

  // Add AI players for testing
  addAIPlayers(count: number = 3): void {
    if (!this.currentLobby) return;
    
    for (let i = 1; i <= count; i++) {
      const aiPlayer = new Player(undefined, `AI_Player_${i}`);
      this.gameModel.joinLobby(this.currentLobby.id, aiPlayer);
      console.log(`AI Player ${i} joined the lobby`);
    }
    this.displayLobbyStatus();
  }

  // Start a game round
  startGame(): void {
    if (!this.currentLobby || !this.currentPlayer) {
      console.log('❌ No lobby or player found');
      return;
    }

    if (this.currentLobby.hostId !== this.currentPlayer.id) {
      console.log('❌ Only the host can start the game');
      return;
    }

    const success = this.gameModel.startGame(this.currentLobby.id, this.currentPlayer.id);
    if (success) {
      console.log('🎮 Game started!');
      this.displayGameState();
      this.simulateRound();
    } else {
      console.log('❌ Failed to start game');
    }
  }

  // Simulate a game round with AI players
  simulateRound(): void {
    if (!this.currentLobby || !this.currentLobby.currentCard || !this.currentPlayer) return;

    console.log(`\n🎯 Round ${this.currentLobby.currentRound}`);
    console.log(`Current card: ${this.currentLobby.currentCard.suit} ${this.currentLobby.currentCard.value}`);

    // Simulate player moves
    this.currentLobby.players.forEach(player => {
      if (player.status === 'active') {
        // Random guess for AI players, strategic guess for human player
        let guess: CardType;
        if (player.id === this.currentPlayer!.id && this.currentLobby!.currentCard!.value) {
          // Human player strategy: guess higher if current card is low
          guess = this.currentLobby!.currentCard!.value < 7 ? CardType.UP : CardType.DOWN;
        } else {
          // AI random guess
          const guesses = [CardType.UP, CardType.DOWN, CardType.EVEN];
          guess = guesses[Math.floor(Math.random() * guesses.length)];
        }
        
        this.gameModel.processPlayerMove(this.currentLobby!.id, player.id, guess);
        console.log(`${player.name} guesses: ${guess}`);
      }
    });

    // Advance the round
    setTimeout(() => {
      this.gameModel.advanceRound(this.currentLobby!.id);
      this.displayRoundResults();
      
      // Continue if game is still active
      if (this.currentLobby!.status === 'exchange' && this.currentLobby!.getActivePlayers().length > 0) {
        setTimeout(() => {
          this.currentLobby!.startRound();
          this.simulateRound();
        }, 2000);
      } else {
        this.displayFinalResults();
      }
    }, 1000);
  }

  // Display current lobby status
  displayLobbyStatus(): void {
    if (!this.currentLobby) return;
    
    console.log('\n📋 Lobby Status:');
    console.log(`Lobby ID: ${this.currentLobby.id}`);
    console.log(`Players: ${this.currentLobby.players.length}/${this.currentLobby.maxPlayers}`);
    console.log(`Host: ${this.currentLobby.players.find(p => p.id === this.currentLobby!.hostId)?.name}`);
    console.log(`Status: ${this.currentLobby.status}`);
    
    this.currentLobby.players.forEach(player => {
      console.log(`  - ${player.name} (Score: ${player.score}, Streak: ${player.streak})`);
    });
  }

  // Display current game state
  displayGameState(): void {
    if (!this.currentLobby) return;
    
    console.log('\n🎮 Game State:');
    console.log(`Round: ${this.currentLobby.currentRound}`);
    console.log(`Cards remaining: ${this.currentLobby.deck.length}`);
    console.log(`Active players: ${this.currentLobby.getActivePlayers().length}`);
  }

  // Display round results
  displayRoundResults(): void {
    if (!this.currentLobby || !this.currentLobby.currentCard) return;
    
    console.log(`\n📊 Round ${this.currentLobby.currentRound} Results:`);
    console.log(`New card: ${this.currentLobby.currentCard.suit} ${this.currentLobby.currentCard.value}`);
    
    this.currentLobby.players.forEach(player => {
      const status = player.status === 'active' ? '✅' : '❌';
      console.log(`${status} ${player.name}: Score ${player.score} (Streak: ${player.streak})`);
    });
  }

  // Display final game results
  displayFinalResults(): void {
    if (!this.currentLobby) return;
    
    console.log('\n🏆 Final Results:');
    
    // Sort players by score
    const sortedPlayers = [...this.currentLobby.players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${index + 1}. ${player.name}: ${player.score} points`);
    });
    
    console.log('\n🎮 Game completed! Thanks for playing UpDown!');
  }
}

// Demo the client
const client = new UpDownClient();

// Join game as human player
client.joinGame('Human_Player');

// Add some AI players
client.addAIPlayers(3);

// Start the game
setTimeout(() => {
  client.startGame();
}, 1000);
