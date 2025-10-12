/**
 * GameModel - Core game logic and state management
 */
import { Card } from './Card.js';
export class GameModel {
    constructor() {
        this.deck = [];
        this.currentCard = null;
        this.previousCard = null;
        this.round = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.phase = 'ready';
        this.gameOver = false;
        this.lastResult = null;
    }
    /**
     * Get number of cards remaining in deck
     */
    get cardsLeft() {
        return this.deck.length;
    }
    /**
     * Start a new game
     */
    startNewGame() {
        this.deck = Card.shuffle(Card.createDeck());
        this.currentCard = this.deck.pop() ?? null;
        this.previousCard = null;
        this.round = 1;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.phase = 'playing';
        this.gameOver = false;
        this.lastResult = null;
    }
    /**
     * Make a guess and get the next card
     */
    makeGuess(guess) {
        if (!this.currentCard || this.deck.length === 0) {
            this.phase = 'game_over';
            this.gameOver = true;
            return { correct: false, nextCard: null };
        }
        const nextCard = this.deck.pop() ?? null;
        if (!nextCard) {
            this.phase = 'game_over';
            this.gameOver = true;
            return { correct: false, nextCard: null };
        }
        let correct = false;
        switch (guess) {
            case 'up':
                correct = nextCard.value > this.currentCard.value;
                break;
            case 'down':
                correct = nextCard.value < this.currentCard.value;
                break;
            case 'equal':
                correct = nextCard.value === this.currentCard.value;
                break;
        }
        this.previousCard = this.currentCard;
        this.currentCard = nextCard;
        this.round++;
        if (correct) {
            this.score += 10 + this.streak;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
        }
        else {
            this.streak = 0;
        }
        this.lastResult = correct;
        if (this.deck.length === 0) {
            this.phase = 'game_over';
            this.gameOver = true;
        }
        return { correct, nextCard };
    }
    /**
     * Get current game state
     */
    getState() {
        return {
            round: this.round,
            score: this.score,
            streak: this.streak,
            maxStreak: this.maxStreak,
            phase: this.phase,
            gameOver: this.gameOver,
            cardsRemaining: this.deck.length
        };
    }
}
