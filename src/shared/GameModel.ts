import { Scenario, Serializable } from './Scenario.js';
import { Lobby, LobbyStatus } from './Lobby.js';
import { Player } from './Player.js';
import { Card } from './Card.js';

export enum GamePhase {
  LOBBY = 'lobby',
  PLACING = 'placing',
  REVEALING = 'revealing',
  EXCHANGE = 'exchange',
  FINISHED = 'finished'
}

export class GameModel implements Serializable {
  public lobbies: Map<string, Lobby>;
  public activePlayers: Map<string, Player>;
  public gamePhase: GamePhase;
  public version: string;

  constructor() {
    this.lobbies = new Map();
    this.activePlayers = new Map();
    this.gamePhase = GamePhase.LOBBY;
    this.version = '1.0.0';
  }

  // Create a new lobby
  createLobby(hostPlayer: Player, maxPlayers: number = 8): Lobby {
    const lobby = new Lobby(hostPlayer.id, maxPlayers);
    lobby.addPlayer(hostPlayer);
    this.lobbies.set(lobby.id, lobby);
    this.activePlayers.set(hostPlayer.id, hostPlayer);
    return lobby;
  }

  // Join existing lobby
  joinLobby(lobbyId: string, player: Player): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    
    const success = lobby.addPlayer(player);
    if (success) {
      this.activePlayers.set(player.id, player);
    }
    return success;
  }

  // Leave lobby
  leaveLobby(lobbyId: string, playerId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    
    const success = lobby.removePlayer(playerId);
    if (success) {
      this.activePlayers.delete(playerId);
      
      // Remove empty lobby
      if (lobby.players.length === 0) {
        this.lobbies.delete(lobbyId);
      }
    }
    return success;
  }

  // Get all available lobbies
  getAvailableLobbies(): Lobby[] {
    return Array.from(this.lobbies.values()).filter(
      lobby => lobby.status === LobbyStatus.WAITING && lobby.players.length < lobby.maxPlayers
    );
  }

  // Get player by ID
  getPlayer(playerId: string): Player | undefined {
    return this.activePlayers.get(playerId);
  }

  // Get lobby by ID
  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  // Start game in lobby
  startGame(lobbyId: string, hostId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby || lobby.hostId !== hostId) return false;
    
    return lobby.startRound();
  }

  // Process player move
  processPlayerMove(lobbyId: string, playerId: string, cardType: any): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const player = this.activePlayers.get(playerId);
    
    if (!lobby || !player || lobby.status !== LobbyStatus.PLAYING) return false;
    
    const card = player.playCard(cardType);
    return card !== null;
  }

  // Advance game round
  advanceRound(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby || lobby.deck.length === 0) return false;
    
    const nextCard = lobby.deck.pop();
    if (!nextCard) return false;
    
    lobby.processRound(nextCard);
    return true;
  }

  // Get game statistics
  getGameStats(): any {
    return {
      totalLobbies: this.lobbies.size,
      activePlayers: this.activePlayers.size,
      gamePhase: this.gamePhase,
      version: this.version
    };
  }

  initFromScenario(scenario: Scenario): void {
    Object.assign(this, scenario.state);
  }

  serializeScenario(): string {
    // Convert Maps to objects for serialization
    const serializableState = {
      lobbies: Array.from(this.lobbies.entries()),
      activePlayers: Array.from(this.activePlayers.entries()),
      gamePhase: this.gamePhase,
      version: this.version
    };
    return JSON.stringify({ class: 'GameModel', state: serializableState });
  }

  static deserializeScenario(scenario: string): GameModel {
    const obj = JSON.parse(scenario);
    const instance = new GameModel();
    
    // Restore Maps from serialized arrays
    if (obj.state.lobbies) {
      instance.lobbies = new Map(obj.state.lobbies);
    }
    if (obj.state.activePlayers) {
      instance.activePlayers = new Map(obj.state.activePlayers);
    }
    
    instance.gamePhase = obj.state.gamePhase || GamePhase.LOBBY;
    instance.version = obj.state.version || '1.0.0';
    
    return instance;
  }
}
