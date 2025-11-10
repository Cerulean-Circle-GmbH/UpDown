/**
 * GameLogicEngine Regression Tests - TRUE Radical OOP v0.3.19.0
 * Tests domain methods and Radical OOP compliance
 * @pdca 2025-11-10-UTC-1745.pdca.md - TRUE Radical OOP migration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultGameLogicEngine } from '../src/ts/layer2/DefaultGameLogicEngine.js';

describe('GameLogicEngine - Radical OOP Architecture', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(() => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
  });

  it('should have empty constructor (Radical OOP principle)', () => {
    const instance = new DefaultGameLogicEngine();
    expect(instance).toBeInstanceOf(DefaultGameLogicEngine);
  });

  it('should have getTarget() method (TRUE Radical OOP 0.3.19.0)', () => {
    // @ts-ignore - Testing protected method
    expect(typeof engine.getTarget).toBe('function');
  });

  it('should have updateModelPaths() method (TRUE Radical OOP 0.3.19.0)', () => {
    // @ts-ignore - Testing private method
    expect(typeof engine.updateModelPaths).toBe('function');
  });
});

describe('GameLogicEngine - Domain Methods: startGame', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(() => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
  });

  it('should start game with default parameters (1 player, rapid mode)', async () => {
    await engine.startGame();
    
    const scenario = await engine.toScenario();
    const gameState = scenario.model.gameState;
    
    expect(gameState).toBeDefined();
    expect(gameState?.players.length).toBe(1);
    expect(gameState?.gameMode).toBe('rapid');
  });

  it('should start game with specified player count', async () => {
    await engine.startGame('3', 'rapid');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.players.length).toBe(3);
  });

  it('should start game with multiplayer mode', async () => {
    await engine.startGame('2', 'multiplayer');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.gameMode).toBe('multiplayer');
  });

  it('should initialize players with correct structure', async () => {
    await engine.startGame('2');
    
    const scenario = await engine.toScenario();
    const player = scenario.model.gameState?.players[0];
    
    expect(player).toBeDefined();
    expect(player?.id).toBe('player_1');
    expect(player?.name).toBe('Player 1');
    expect(player?.score).toBe(0);
    expect(player?.streak).toBe(0);
    expect(player?.maxStreak).toBe(0);
    expect(player?.isActive).toBe(true);
    expect(player?.hand).toBeDefined();
    expect(player?.hand.upCard).toBe(1);
    expect(player?.hand.downCard).toBe(1);
    expect(player?.hand.evenCard).toBe(1);
  });

  it('should initialize game state with phase ready', async () => {
    await engine.startGame('2');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.phase).toBe('ready');
    expect(scenario.model.gameState?.round).toBe(0);
    expect(scenario.model.gameState?.currentCard).toBe(null);
    expect(scenario.model.gameState?.previousCard).toBe(null);
  });

  it('should reject invalid player counts', async () => {
    await engine.startGame('0');
    const scenario1 = await engine.toScenario();
    expect(scenario1.model.gameState).toBeUndefined();
    
    await engine.startGame('11');
    const scenario2 = await engine.toScenario();
    expect(scenario2.model.gameState).toBeUndefined();
  });

  it('should update model.updatedAt timestamp', async () => {
    const scenario1 = await engine.toScenario();
    const timestamp1 = scenario1.model.updatedAt;
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await engine.startGame('2');
    
    const scenario2 = await engine.toScenario();
    const timestamp2 = scenario2.model.updatedAt;
    
    expect(timestamp2).not.toBe(timestamp1);
  });
});

describe('GameLogicEngine - Domain Methods: makeGuess', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(async () => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
    await engine.startGame('2', 'rapid');
  });

  it('should record player guess', async () => {
    await engine.makeGuess('player_1', 'up');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.currentGuesses?.get('player_1')).toBe('up');
  });

  it('should accept all valid guesses: up, down, even', async () => {
    await engine.makeGuess('player_1', 'up');
    await engine.makeGuess('player_2', 'down');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.currentGuesses?.get('player_1')).toBe('up');
    expect(scenario.model.gameState?.currentGuesses?.get('player_2')).toBe('down');
  });

  it('should reject invalid guesses', async () => {
    await engine.makeGuess('player_1', 'invalid');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.currentGuesses?.has('player_1')).toBeFalsy();
  });

  it('should reject guess from non-existent player', async () => {
    await engine.makeGuess('player_99', 'up');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.currentGuesses?.has('player_99')).toBeFalsy();
  });

  it('should reject guess when no game is active', async () => {
    const newEngine = new DefaultGameLogicEngine();
    newEngine.init({});
    
    await newEngine.makeGuess('player_1', 'up');
    
    const scenario = await newEngine.toScenario();
    expect(scenario.model.gameState).toBeUndefined();
  });
});

describe('GameLogicEngine - Domain Methods: dealNextCard', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(async () => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
    await engine.startGame('2', 'rapid');
  });

  it('should deal a random card', async () => {
    await engine.dealNextCard();
    
    const scenario = await engine.toScenario();
    const currentCard = scenario.model.gameState?.currentCard;
    
    expect(currentCard).toBeDefined();
    expect(currentCard?.value).toBeGreaterThanOrEqual(1);
    expect(currentCard?.value).toBeLessThanOrEqual(13);
    expect(['Hearts', 'Diamonds', 'Clubs', 'Spades']).toContain(currentCard?.suit);
  });

  it('should deal specified card value for testing', async () => {
    await engine.dealNextCard('7');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.currentCard?.value).toBe(7);
  });

  it('should move current card to previous card', async () => {
    await engine.dealNextCard('5');
    const scenario1 = await engine.toScenario();
    const firstCard = scenario1.model.gameState?.currentCard;
    
    await engine.dealNextCard('10');
    const scenario2 = await engine.toScenario();
    
    expect(scenario2.model.gameState?.previousCard?.value).toBe(firstCard?.value);
    expect(scenario2.model.gameState?.currentCard?.value).toBe(10);
  });

  it('should increment round counter', async () => {
    await engine.dealNextCard();
    const scenario1 = await engine.toScenario();
    expect(scenario1.model.gameState?.round).toBe(1);
    
    await engine.dealNextCard();
    const scenario2 = await engine.toScenario();
    expect(scenario2.model.gameState?.round).toBe(2);
  });

  it('should evaluate guesses when previous card exists', async () => {
    await engine.dealNextCard('5');
    await engine.makeGuess('player_1', 'up');
    await engine.makeGuess('player_2', 'down');
    await engine.dealNextCard('10');
    
    const scenario = await engine.toScenario();
    const player1 = scenario.model.gameState?.players.find(p => p.id === 'player_1');
    const player2 = scenario.model.gameState?.players.find(p => p.id === 'player_2');
    
    // Player 1 guessed up (5 -> 10) = correct
    expect(player1?.score).toBe(10);
    expect(player1?.streak).toBe(1);
    expect(player1?.isActive).toBe(true);
    
    // Player 2 guessed down (5 -> 10) = wrong
    expect(player2?.score).toBe(0);
    expect(player2?.streak).toBe(0);
    expect(player2?.isActive).toBe(false);
  });
});

describe('GameLogicEngine - Domain Methods: showGameStatus', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(async () => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
  });

  it('should execute without errors when no game', async () => {
    await expect(engine.showGameStatus()).resolves.toBeDefined();
  });

  it('should execute without errors with active game', async () => {
    await engine.startGame('2');
    await expect(engine.showGameStatus()).resolves.toBeDefined();
  });

  it('should execute without errors with cards dealt', async () => {
    await engine.startGame('2');
    await engine.dealNextCard();
    await expect(engine.showGameStatus()).resolves.toBeDefined();
  });
});

describe('GameLogicEngine - Guess Evaluation Logic', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(async () => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
    await engine.startGame('3', 'rapid');
  });

  it('should correctly evaluate UP guess', async () => {
    await engine.dealNextCard('5');
    await engine.makeGuess('player_1', 'up');
    await engine.dealNextCard('10'); // 5 -> 10 = UP
    
    const scenario = await engine.toScenario();
    const player = scenario.model.gameState?.players.find(p => p.id === 'player_1');
    
    expect(player?.score).toBe(10);
    expect(player?.streak).toBe(1);
    expect(player?.isActive).toBe(true);
  });

  it('should correctly evaluate DOWN guess', async () => {
    await engine.dealNextCard('10');
    await engine.makeGuess('player_1', 'down');
    await engine.dealNextCard('3'); // 10 -> 3 = DOWN
    
    const scenario = await engine.toScenario();
    const player = scenario.model.gameState?.players.find(p => p.id === 'player_1');
    
    expect(player?.score).toBe(10);
    expect(player?.streak).toBe(1);
  });

  it('should correctly evaluate EVEN guess', async () => {
    await engine.dealNextCard('7');
    await engine.makeGuess('player_1', 'even');
    await engine.dealNextCard('7'); // 7 -> 7 = EVEN
    
    const scenario = await engine.toScenario();
    const player = scenario.model.gameState?.players.find(p => p.id === 'player_1');
    
    expect(player?.score).toBe(10);
    expect(player?.streak).toBe(1);
  });

  it('should eliminate player on wrong guess', async () => {
    await engine.dealNextCard('5');
    await engine.makeGuess('player_1', 'down');
    await engine.dealNextCard('10'); // Guessed down, but went up
    
    const scenario = await engine.toScenario();
    const player = scenario.model.gameState?.players.find(p => p.id === 'player_1');
    
    expect(player?.score).toBe(0);
    expect(player?.streak).toBe(0);
    expect(player?.isActive).toBe(false);
  });

  it('should maintain streak across multiple correct guesses', async () => {
    await engine.dealNextCard('5');
    await engine.makeGuess('player_1', 'up');
    await engine.dealNextCard('8');
    
    await engine.makeGuess('player_1', 'up');
    await engine.dealNextCard('12');
    
    const scenario = await engine.toScenario();
    const player = scenario.model.gameState?.players.find(p => p.id === 'player_1');
    
    expect(player?.score).toBe(20);
    expect(player?.streak).toBe(2);
    expect(player?.maxStreak).toBe(2);
  });

  it('should end game when only one player remains active', async () => {
    await engine.dealNextCard('5');
    await engine.makeGuess('player_1', 'up');
    await engine.makeGuess('player_2', 'down');
    await engine.makeGuess('player_3', 'down');
    await engine.dealNextCard('10'); // Only player_1 correct
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.phase).toBe('game_over');
  });
});

describe('GameLogicEngine - Method Chaining (Radical OOP)', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(() => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
  });

  it('should support method chaining', async () => {
    const result = await engine
      .startGame('2')
      .then(e => e.dealNextCard('5'))
      .then(e => e.makeGuess('player_1', 'up'))
      .then(e => e.dealNextCard('10'))
      .then(e => e.showGameStatus());
    
    expect(result).toBeInstanceOf(DefaultGameLogicEngine);
  });

  it('should return this from all domain methods', async () => {
    await engine.startGame('2');
    expect(await engine.makeGuess('player_1', 'up')).toBe(engine);
    expect(await engine.dealNextCard()).toBe(engine);
    expect(await engine.showGameStatus()).toBe(engine);
  });
});

describe('GameLogicEngine - Model-Driven State (Radical OOP)', () => {
  let engine: DefaultGameLogicEngine;

  beforeEach(async () => {
    engine = new DefaultGameLogicEngine();
    engine.init({});
    await engine.startGame('2');
  });

  it('should store game state in model', async () => {
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState).toBeDefined();
    expect(scenario.model.gameState?.players).toBeDefined();
  });

  it('should store guesses in gameState', async () => {
    await engine.makeGuess('player_1', 'up');
    
    const scenario = await engine.toScenario();
    expect(scenario.model.gameState?.currentGuesses).toBeDefined();
  });

  it('should never recalculate state (Radical OOP principle)', async () => {
    await engine.dealNextCard();
    
    const scenario1 = await engine.toScenario();
    const scenario2 = await engine.toScenario();
    
    // Same model reference = no recalculation
    expect(scenario1.model.gameState).toBe(scenario2.model.gameState);
  });
});

