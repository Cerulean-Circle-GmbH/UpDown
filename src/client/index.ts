// Client entry point
import { GameModel } from '../shared/GameModel.js';
import { Card } from '../shared/Card.js';

console.log('Client booting...');

class GameUI {
  private game: GameModel;
  private elements: {
    round: HTMLElement;
    score: HTMLElement;
    streak: HTMLElement;
    cardsLeft: HTMLElement;
    previousCard: HTMLElement;
    currentCard: HTMLElement;
    resultMessage: HTMLElement;
    choices: HTMLElement;
    startBtn: HTMLElement;
    gameOver: HTMLElement;
    finalScore: HTMLElement;
    finalRounds: HTMLElement;
    finalStreak: HTMLElement;
    restartBtn: HTMLElement;
    btnUp: HTMLButtonElement;
    btnDown: HTMLButtonElement;
    btnEqual: HTMLButtonElement;
  };

  constructor() {
    this.game = new GameModel();
    
    // Get all DOM elements
    this.elements = {
      round: document.getElementById('round')!,
      score: document.getElementById('score')!,
      streak: document.getElementById('streak')!,
      cardsLeft: document.getElementById('cards-left')!,
      previousCard: document.getElementById('previous-card')!,
      currentCard: document.getElementById('current-card')!,
      resultMessage: document.getElementById('result-message')!,
      choices: document.getElementById('choices')!,
      startBtn: document.getElementById('start-btn')!,
      gameOver: document.getElementById('game-over')!,
      finalScore: document.getElementById('final-score')!,
      finalRounds: document.getElementById('final-rounds')!,
      finalStreak: document.getElementById('final-streak')!,
      restartBtn: document.getElementById('restart-btn')!,
      btnUp: document.getElementById('btn-up') as HTMLButtonElement,
      btnDown: document.getElementById('btn-down') as HTMLButtonElement,
      btnEqual: document.getElementById('btn-equal') as HTMLButtonElement,
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.elements.startBtn.addEventListener('click', () => this.startGame());
    this.elements.restartBtn.addEventListener('click', () => this.restartGame());
    this.elements.btnUp.addEventListener('click', () => this.makeGuess('up'));
    this.elements.btnDown.addEventListener('click', () => this.makeGuess('down'));
    this.elements.btnEqual.addEventListener('click', () => this.makeGuess('equal'));
  }

  private startGame(): void {
    this.game.startNewGame();
    this.elements.startBtn.style.display = 'none';
    this.enableChoices();
    this.updateUI();
    this.renderCard(this.game.currentCard!, this.elements.currentCard);
  }

  private restartGame(): void {
    this.elements.gameOver.classList.add('hidden');
    this.startGame();
  }

  private makeGuess(guess: 'up' | 'down' | 'equal'): void {
    this.disableChoices();
    
    const result = this.game.makeGuess(guess);
    
    // Show result message
    this.elements.resultMessage.textContent = result.correct ? '✓ Correct!' : '✗ Wrong!';
    this.elements.resultMessage.className = `result-message ${result.correct ? 'correct' : 'wrong'}`;
    
    // Update previous card
    if (this.game.previousCard) {
      this.renderCard(this.game.previousCard, this.elements.previousCard);
    }
    
    // Update current card with animation
    if (this.game.currentCard) {
      setTimeout(() => {
        this.renderCard(this.game.currentCard!, this.elements.currentCard);
      }, 300);
    }
    
    // Update stats
    this.updateUI();
    
    // Handle game over or continue
    setTimeout(() => {
      if (this.game.gameOver) {
        this.showGameOver();
      } else {
        this.elements.resultMessage.textContent = '';
        this.enableChoices();
      }
    }, 1500);
  }

  private updateUI(): void {
    this.elements.round.textContent = this.game.round.toString();
    this.elements.score.textContent = this.game.score.toString();
    this.elements.streak.textContent = this.game.streak.toString();
    this.elements.cardsLeft.textContent = this.game.deck.length.toString();
  }

  private renderCard(card: Card, element: HTMLElement): void {
    element.className = `card-slot card ${card.getColor()} flip-in`;
    element.innerHTML = `
      <div class="card-value">${card.getDisplayValue()}</div>
      <div class="card-suit">${card.suit}</div>
    `;
  }

  private enableChoices(): void {
    this.elements.btnUp.disabled = false;
    this.elements.btnDown.disabled = false;
    this.elements.btnEqual.disabled = false;
  }

  private disableChoices(): void {
    this.elements.btnUp.disabled = true;
    this.elements.btnDown.disabled = true;
    this.elements.btnEqual.disabled = true;
  }

  private showGameOver(): void {
    this.elements.finalScore.textContent = this.game.score.toString();
    this.elements.finalRounds.textContent = (this.game.round - 1).toString();
    this.elements.finalStreak.textContent = this.game.maxStreak.toString();
    this.elements.gameOver.classList.remove('hidden');
  }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GameUI();
  });
} else {
  new GameUI();
}
