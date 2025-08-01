// Basic test runner for UpDown game logic
// Tests the core game models and functionality

import { GameModel } from '../dist/shared/GameModel.js';
import { Player } from '../dist/shared/Player.js';
import { Lobby } from '../dist/shared/Lobby.js';
import { Card, Suit, CardType } from '../dist/shared/Card.js';

// Simple test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🎮 Running UpDown Game Logic Tests\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// Test suite
const runner = new TestRunner();

// Card tests
runner.test('Card creation and comparison', () => {
  const card1 = Card.createPlayingCard(Suit.HEARTS, 5);
  const card2 = Card.createPlayingCard(Suit.SPADES, 8);
  const card3 = Card.createPlayingCard(Suit.DIAMONDS, 5);
  
  assert(card1.suit === Suit.HEARTS, 'Card suit should be HEARTS');
  assert(card1.value === 5, 'Card value should be 5');
  
  assert(card2.isHigherThan(card1), 'Card 2 should be higher than card 1');
  assert(card1.isLowerThan(card2), 'Card 1 should be lower than card 2');
  assert(card1.isEqualTo(card3), 'Card 1 should equal card 3');
});

runner.test('Special card creation', () => {
  const specialCard = Card.createSpecialCard('double_points');
  
  assert(specialCard.type === CardType.SPECIAL, 'Should be special card type');
  assert(specialCard.specialEffect === 'double_points', 'Should have correct effect');
  assert(specialCard.value === undefined, 'Special cards should not have value');
});

// Player tests
runner.test('Player creation and basic functionality', () => {
  const player = new Player('test_id', 'TestPlayer');
  
  assertEqual(player.id, 'test_id', 'Player ID should match');
  assertEqual(player.name, 'TestPlayer', 'Player name should match');
  assertEqual(player.score, 0, 'Initial score should be 0');
  assertEqual(player.streak, 0, 'Initial streak should be 0');
  assert(player.hand.length === 3, 'Player should start with 3 cards');
});

runner.test('Player card playing', () => {
  const player = new Player();
  
  const upCard = player.playCard(CardType.UP);
  assert(upCard !== null, 'Should be able to play UP card');
  assert(upCard.type === CardType.UP, 'Played card should be UP type');
  
  // Hand should still have 3 cards (replaced)
  assert(player.hand.length === 3, 'Hand should still have 3 cards after playing');
});

runner.test('Player scoring system', () => {
  const player = new Player();
  
  // Test basic scoring
  player.correctGuess();
  assertEqual(player.score, 10, 'First correct guess should give 10 points');
  assertEqual(player.streak, 1, 'Streak should be 1');
  
  // Test streak bonus
  for (let i = 0; i < 4; i++) {
    player.correctGuess();
  }
  assertEqual(player.streak, 5, 'Streak should be 5');
  assert(player.score > 50, 'Score should include streak bonus');
  
  // Test incorrect guess
  player.incorrectGuess();
  assertEqual(player.streak, 0, 'Streak should reset to 0');
});

// Lobby tests
runner.test('Lobby creation and player management', () => {
  const host = new Player('host', 'Host');
  const lobby = new Lobby(host.id, 4);
  
  assert(lobby.addPlayer(host), 'Should be able to add host');
  assertEqual(lobby.hostId, host.id, 'Host should be set correctly');
  assertEqual(lobby.players.length, 1, 'Lobby should have 1 player');
  
  const player2 = new Player('p2', 'Player2');
  assert(lobby.addPlayer(player2), 'Should be able to add second player');
  assertEqual(lobby.players.length, 2, 'Lobby should have 2 players');
});

runner.test('Lobby game flow', () => {
  const host = new Player('host', 'Host');
  const lobby = new Lobby(host.id, 2);
  lobby.addPlayer(host);
  
  const player2 = new Player('p2', 'Player2');
  lobby.addPlayer(player2);
  
  // Start round
  assert(lobby.startRound(), 'Should be able to start round');
  assert(lobby.currentCard !== undefined, 'Current card should be set');
  assert(lobby.deck.length === 51, 'Deck should have 51 cards after drawing one');
  
  // Players should be active
  lobby.players.forEach(player => {
    assertEqual(player.status, 'active', 'Players should be active');
  });
});

// GameModel tests
runner.test('GameModel lobby management', () => {
  const gameModel = new GameModel();
  const host = new Player('host', 'Host');
  
  const lobby = gameModel.createLobby(host, 4);
  
  assert(gameModel.lobbies.has(lobby.id), 'GameModel should contain the lobby');
  assert(gameModel.activePlayers.has(host.id), 'GameModel should track active player');
  
  const player2 = new Player('p2', 'Player2');
  assert(gameModel.joinLobby(lobby.id, player2), 'Player should be able to join lobby');
  assert(gameModel.activePlayers.has(player2.id), 'Player2 should be tracked');
});

runner.test('GameModel serialization', () => {
  const gameModel = new GameModel();
  const host = new Player('host', 'Host');
  gameModel.createLobby(host, 4);
  
  const serialized = gameModel.serializeScenario();
  assert(typeof serialized === 'string', 'Serialization should return string');
  
  const deserialized = GameModel.deserializeScenario(serialized);
  assert(deserialized instanceof GameModel, 'Deserialization should return GameModel');
  assertEqual(deserialized.version, gameModel.version, 'Version should match');
});

// Run tests
runner.run().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! The game logic is working correctly.');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n🚨 Test runner error:', error);
  process.exit(1);
});