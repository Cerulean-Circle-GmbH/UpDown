import { Scenario, Serializable } from './Scenario.js';
import { Player, PlayerStatus } from './Player.js';
import { Card, Suit, CardType } from './Card.js';

export enum LobbyStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  EXCHANGE = 'exchange'
}

export class Lobby implements Serializable {
  public id: string;
  public hostId: string;
  public players: Player[];
  public maxPlayers: number;
  public status: LobbyStatus;
  public currentRound: number;
  public deck: Card[];
  public currentCard?: Card;
  public roundTimeLimit: number; // seconds
  public roundStartTime?: number;

  constructor(hostId?: string, maxPlayers: number = 8) {
    this.id = this.generateId();
    this.hostId = hostId || '';
    this.players = [];
    this.maxPlayers = maxPlayers;
    this.status = LobbyStatus.WAITING;
    this.currentRound = 0;
    this.deck = this.createStandardDeck();
    this.roundTimeLimit = 10;
  }

  private generateId(): string {
    return 'lobby_' + Math.random().toString(36).substr(2, 9);
  }

  private createStandardDeck(): Card[] {
    const deck: Card[] = [];
    const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
    
    for (const suit of suits) {
      for (let value = 1; value <= 13; value++) {
        deck.push(Card.createPlayingCard(suit, value));
      }
    }
    
    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Add player to lobby
  addPlayer(player: Player): boolean {
    if (this.players.length >= this.maxPlayers) return false;
    if (this.players.find(p => p.id === player.id)) return false;
    
    this.players.push(player);
    player.status = PlayerStatus.WAITING;
    
    // Set host if this is the first player
    if (this.players.length === 1 && !this.hostId) {
      this.hostId = player.id;
    }
    
    return true;
  }

  // Remove player from lobby
  removePlayer(playerId: string): boolean {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index === -1) return false;
    
    this.players.splice(index, 1);
    
    // Assign new host if current host left
    if (this.hostId === playerId && this.players.length > 0) {
      this.hostId = this.players[0].id;
    }
    
    return true;
  }

  // Start a new game round
  startRound(): boolean {
    if (this.status !== LobbyStatus.WAITING && this.status !== LobbyStatus.EXCHANGE) return false;
    if (this.players.length === 0) return false;
    if (this.deck.length === 0) return false;
    
    this.status = LobbyStatus.PLAYING;
    this.currentRound++;
    this.roundStartTime = Date.now();
    
    // Reset all players for new round
    this.players.forEach(player => player.resetForNewRound());
    
    // Draw current card
    this.currentCard = this.deck.pop();
    
    return true;
  }

  // Process round results
  processRound(nextCard: Card): void {
    if (!this.currentCard) return;
    
    this.players.forEach(player => {
      if (player.status !== PlayerStatus.ACTIVE) return;
      if (!player.lastGuess) {
        player.incorrectGuess();
        return;
      }
      
      let isCorrect = false;
      
      switch (player.lastGuess) {
        case CardType.UP:
          isCorrect = nextCard.isHigherThan(this.currentCard!);
          break;
        case CardType.DOWN:
          isCorrect = nextCard.isLowerThan(this.currentCard!);
          break;
        case CardType.EVEN:
          isCorrect = nextCard.isEqualTo(this.currentCard!);
          break;
      }
      
      if (isCorrect) {
        player.correctGuess();
      } else {
        player.incorrectGuess();
      }
    });
    
    this.currentCard = nextCard;
    
    // Check if round should end
    const activePlayers = this.players.filter(p => p.status === PlayerStatus.ACTIVE);
    if (activePlayers.length === 0 || this.deck.length === 0) {
      this.endGame();
    } else {
      this.status = LobbyStatus.EXCHANGE;
    }
  }

  // End the current game
  endGame(): void {
    this.status = LobbyStatus.WAITING;
    this.currentRound = 0;
    this.deck = this.createStandardDeck();
    this.currentCard = undefined;
    this.roundStartTime = undefined;
    
    // Reset all players
    this.players.forEach(player => {
      player.status = PlayerStatus.WAITING;
      player.lastGuess = undefined;
    });
  }

  // Get active players
  getActivePlayers(): Player[] {
    return this.players.filter(p => p.status === PlayerStatus.ACTIVE);
  }

  // Check if round time limit exceeded
  isRoundTimeExpired(): boolean {
    if (!this.roundStartTime) return false;
    return (Date.now() - this.roundStartTime) > (this.roundTimeLimit * 1000);
  }

  initFromScenario(scenario: Scenario): void {
    Object.assign(this, scenario.state);
  }

  serializeScenario(): string {
    return JSON.stringify({ class: 'Lobby', state: this });
  }

  static deserializeScenario(scenario: string): Lobby {
    const obj = JSON.parse(scenario);
    const instance = new Lobby();
    instance.initFromScenario(obj);
    return instance;
  }
}
