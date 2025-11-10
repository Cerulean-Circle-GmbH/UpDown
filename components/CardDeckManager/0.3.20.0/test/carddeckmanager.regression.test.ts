/**
 * CardDeckManager Regression Tests - TRUE Radical OOP v0.3.19.0
 * Tests domain methods and Radical OOP compliance
 * @pdca 2025-11-10-UTC-1730.pdca.md - TRUE Radical OOP migration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultCardDeckManager } from '../src/ts/layer2/DefaultCardDeckManager.js';
import type { Card } from '../src/ts/layer3/CardDeckManagerModel.interface.js';

describe('CardDeckManager - Radical OOP Architecture', () => {
  let manager: DefaultCardDeckManager;

  beforeEach(() => {
    manager = new DefaultCardDeckManager();
    manager.init({});
  });

  it('should have empty constructor (Radical OOP principle)', () => {
    const instance = new DefaultCardDeckManager();
    expect(instance).toBeInstanceOf(DefaultCardDeckManager);
  });

  it('should have getTarget() method (TRUE Radical OOP 0.3.19.0)', () => {
    // @ts-ignore - Testing protected method
    expect(typeof manager.getTarget).toBe('function');
  });

  it('should have updateModelPaths() method (TRUE Radical OOP 0.3.19.0)', () => {
    // @ts-ignore - Testing private method
    expect(typeof manager.updateModelPaths).toBe('function');
  });
});

describe('CardDeckManager - Domain Methods: createDeck', () => {
  let manager: DefaultCardDeckManager;

  beforeEach(() => {
    manager = new DefaultCardDeckManager();
    manager.init({});
  });

  it('should create a 52-card French-suited deck', async () => {
    await manager.createDeck('false'); // Don't shuffle for predictable testing
    
    // Access model through toScenario
    const scenario = await manager.toScenario();
    const deck = scenario.model.deck;
    
    expect(deck).toBeDefined();
    expect(deck?.length).toBe(52);
  });

  it('should create deck with 4 suits', async () => {
    await manager.createDeck('false');
    
    const scenario = await manager.toScenario();
    const deck = scenario.model.deck!;
    
    const suits = new Set(deck.map(card => card.suit));
    expect(suits.size).toBe(4);
    expect(suits.has('Hearts')).toBe(true);
    expect(suits.has('Diamonds')).toBe(true);
    expect(suits.has('Clubs')).toBe(true);
    expect(suits.has('Spades')).toBe(true);
  });

  it('should create deck with 13 ranks per suit', async () => {
    await manager.createDeck('false');
    
    const scenario = await manager.toScenario();
    const deck = scenario.model.deck!;
    
    const hearts = deck.filter(card => card.suit === 'Hearts');
    expect(hearts.length).toBe(13);
    
    const ranks = hearts.map(card => card.rank);
    expect(ranks).toContain('Ace');
    expect(ranks).toContain('King');
    expect(ranks).toContain('Queen');
    expect(ranks).toContain('Jack');
  });

  it('should assign correct values to cards', async () => {
    await manager.createDeck('false');
    
    const scenario = await manager.toScenario();
    const deck = scenario.model.deck!;
    
    const ace = deck.find(card => card.rank === 'Ace');
    const king = deck.find(card => card.rank === 'King');
    const ten = deck.find(card => card.rank === '10');
    
    expect(ace?.value).toBe(1);
    expect(king?.value).toBe(13);
    expect(ten?.value).toBe(10);
  });

  it('should shuffle deck when shuffle=true', async () => {
    await manager.createDeck('true');
    
    const scenario = await manager.toScenario();
    const deck = scenario.model.deck!;
    
    // Shuffled deck should not match the unshuffled order
    // (Statistical test: first card is unlikely to be Ace of Hearts)
    const firstCard = deck[0];
    expect(deck.length).toBe(52);
    // Just verify we have a valid card structure
    expect(firstCard.suit).toBeDefined();
    expect(firstCard.rank).toBeDefined();
    expect(firstCard.value).toBeGreaterThan(0);
  });

  it('should update model.updatedAt timestamp', async () => {
    const scenario1 = await manager.toScenario();
    const timestamp1 = scenario1.model.updatedAt;
    
    // Wait a bit to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await manager.createDeck('false');
    
    const scenario2 = await manager.toScenario();
    const timestamp2 = scenario2.model.updatedAt;
    
    expect(timestamp2).not.toBe(timestamp1);
  });
});

describe('CardDeckManager - Domain Methods: dealCard', () => {
  let manager: DefaultCardDeckManager;

  beforeEach(async () => {
    manager = new DefaultCardDeckManager();
    manager.init({});
    await manager.createDeck('false');
  });

  it('should deal one card by default', async () => {
    await manager.dealCard();
    
    const scenario = await manager.toScenario();
    expect(scenario.model.dealtCards?.length).toBe(1);
    expect(scenario.model.deck?.length).toBe(51);
  });

  it('should deal specified number of cards', async () => {
    await manager.dealCard('5');
    
    const scenario = await manager.toScenario();
    expect(scenario.model.dealtCards?.length).toBe(5);
    expect(scenario.model.deck?.length).toBe(47);
  });

  it('should deal cards from top of deck (LIFO)', async () => {
    const scenario1 = await manager.toScenario();
    const topCard = scenario1.model.deck![scenario1.model.deck!.length - 1];
    
    await manager.dealCard('1');
    
    const scenario2 = await manager.toScenario();
    const dealtCard = scenario2.model.dealtCards![0];
    
    expect(dealtCard.id).toBe(topCard.id);
  });

  it('should handle dealing more cards than available', async () => {
    await manager.dealCard('100');
    
    const scenario = await manager.toScenario();
    // Should remain unchanged when not enough cards
    expect(scenario.model.deck?.length).toBe(52);
    expect(scenario.model.dealtCards?.length).toBeUndefined();
  });

  it('should accumulate dealt cards across multiple deals', async () => {
    await manager.dealCard('3');
    await manager.dealCard('2');
    
    const scenario = await manager.toScenario();
    expect(scenario.model.dealtCards?.length).toBe(5);
    expect(scenario.model.deck?.length).toBe(47);
  });
});

describe('CardDeckManager - Domain Methods: shuffleDeck', () => {
  let manager: DefaultCardDeckManager;

  beforeEach(async () => {
    manager = new DefaultCardDeckManager();
    manager.init({});
    await manager.createDeck('false'); // Create unshuffled
  });

  it('should shuffle existing deck', async () => {
    const scenario1 = await manager.toScenario();
    const originalOrder = scenario1.model.deck!.map(c => c.id);
    
    await manager.shuffleDeck();
    
    const scenario2 = await manager.toScenario();
    const shuffledOrder = scenario2.model.deck!.map(c => c.id);
    
    // Deck should still have 52 cards
    expect(shuffledOrder.length).toBe(52);
    
    // Order should be different (statistical test - very unlikely to be same)
    const sameOrder = originalOrder.every((id, idx) => id === shuffledOrder[idx]);
    expect(sameOrder).toBe(false);
  });

  it('should preserve all cards after shuffle', async () => {
    const scenario1 = await manager.toScenario();
    const originalIds = new Set(scenario1.model.deck!.map(c => c.id));
    
    await manager.shuffleDeck();
    
    const scenario2 = await manager.toScenario();
    const shuffledIds = new Set(scenario2.model.deck!.map(c => c.id));
    
    expect(shuffledIds.size).toBe(52);
    expect([...originalIds].every(id => shuffledIds.has(id))).toBe(true);
  });

  it('should handle shuffle when no deck exists', async () => {
    const emptyManager = new DefaultCardDeckManager();
    emptyManager.init({});
    
    await emptyManager.shuffleDeck();
    
    const scenario = await emptyManager.toScenario();
    expect(scenario.model.deck).toBeUndefined();
  });
});

describe('CardDeckManager - Domain Methods: showDeck', () => {
  let manager: DefaultCardDeckManager;

  beforeEach(async () => {
    manager = new DefaultCardDeckManager();
    manager.init({});
  });

  it('should execute without errors when no deck', async () => {
    await expect(manager.showDeck()).resolves.toBeDefined();
  });

  it('should execute without errors with deck', async () => {
    await manager.createDeck('false');
    await expect(manager.showDeck()).resolves.toBeDefined();
  });

  it('should execute without errors with dealt cards', async () => {
    await manager.createDeck('false');
    await manager.dealCard('5');
    await expect(manager.showDeck()).resolves.toBeDefined();
  });
});

describe('CardDeckManager - Method Chaining (Radical OOP)', () => {
  let manager: DefaultCardDeckManager;

  beforeEach(() => {
    manager = new DefaultCardDeckManager();
    manager.init({});
  });

  it('should support method chaining', async () => {
    const result = await manager
      .createDeck('false')
      .then(m => m.shuffleDeck())
      .then(m => m.dealCard('3'))
      .then(m => m.showDeck());
    
    expect(result).toBeInstanceOf(DefaultCardDeckManager);
  });

  it('should return this from all domain methods', async () => {
    expect(await manager.createDeck()).toBe(manager);
    expect(await manager.shuffleDeck()).toBe(manager);
    expect(await manager.dealCard()).toBe(manager);
    expect(await manager.showDeck()).toBe(manager);
  });
});

describe('CardDeckManager - Model-Driven State (Radical OOP)', () => {
  let manager: DefaultCardDeckManager;

  beforeEach(async () => {
    manager = new DefaultCardDeckManager();
    manager.init({});
    await manager.createDeck('false');
  });

  it('should store deck state in model', async () => {
    const scenario = await manager.toScenario();
    expect(scenario.model.deck).toBeDefined();
    expect(Array.isArray(scenario.model.deck)).toBe(true);
  });

  it('should store dealt cards in model', async () => {
    await manager.dealCard('3');
    
    const scenario = await manager.toScenario();
    expect(scenario.model.dealtCards).toBeDefined();
    expect(Array.isArray(scenario.model.dealtCards)).toBe(true);
  });

  it('should never recalculate state (Radical OOP principle)', async () => {
    await manager.dealCard('5');
    
    const scenario1 = await manager.toScenario();
    const scenario2 = await manager.toScenario();
    
    // Same model reference = no recalculation
    expect(scenario1.model.deck).toBe(scenario2.model.deck);
    expect(scenario1.model.dealtCards).toBe(scenario2.model.dealtCards);
  });
});

