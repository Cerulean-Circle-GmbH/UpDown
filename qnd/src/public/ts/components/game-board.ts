/**
 * GameBoard - Main Lit web component that orchestrates the game
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { GameModel, PlayerGuess } from '../GameModel.ts';
import './game-card.ts';
import './game-stats.ts';
import './game-controls.ts';

@customElement('game-board')
export class GameBoard extends LitElement {
  @state()
  private game: GameModel = new GameModel();

  @state()
  private isGameActive: boolean = false;

  @state()
  private resultMessage: string = '';

  @state()
  private resultClass: string = '';

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .game-container {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .game-header {
      padding: 1.5rem;
      text-align: center;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    }

    h1 {
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
      font-weight: 800;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .game-board-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
      padding: 2rem 1rem;
      gap: 2rem;
      overflow-y: auto;
    }

    .cards-container {
      display: flex;
      gap: 2rem;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }

    .card-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .card-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    }

    .result-message {
      min-height: 2rem;
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      padding: 1rem;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .result-message.correct {
      background: rgba(72, 187, 120, 0.2);
      color: #9ae6b4;
      animation: slideInBounce 0.5s ease;
    }

    .result-message.wrong {
      background: rgba(245, 101, 101, 0.2);
      color: #fc8181;
      animation: shake 0.5s ease;
    }

    .result-message.stopped {
      background: rgba(237, 137, 54, 0.2);
      color: #f6ad55;
    }

    .game-over {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .game-over.hidden {
      display: none;
    }

    .game-over-content {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 3rem;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }

    .game-over h2 {
      font-size: 3rem;
      margin: 0 0 2rem 0;
      color: white;
    }

    .final-stats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      font-size: 1.25rem;
    }

    .restart-btn {
      padding: 1rem 2.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .restart-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    }

    @keyframes slideInBounce {
      0% {
        transform: translateY(-20px);
        opacity: 0;
      }
      50% {
        transform: translateY(5px);
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }

      .game-board-content {
        padding: 1rem 0.5rem;
        gap: 1.5rem;
      }

      .cards-container {
        gap: 1rem;
      }
    }

    @media (orientation: landscape) and (max-height: 600px) {
      .game-board-content {
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
      }

      .cards-container {
        flex-direction: column;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._setupKeyboardControls();
  }

  render() {
    return html`
      <div class="game-container">
        <header class="game-header">
          <h1>🎴 UpDown <small style="opacity: 0.7; font-size: 0.5em;">Lit</small></h1>
          <game-stats
            .round=${this.game.round}
            .score=${this.game.score}
            .streak=${this.game.streak}
            .cardsLeft=${this.game.deck.length}
          ></game-stats>
        </header>

        <main class="game-board-content">
          <div class="cards-container">
            ${this.game.previousCard ? html`
              <div class="card-section">
                <div class="card-label">Previous</div>
                <game-card .card=${this.game.previousCard}></game-card>
              </div>
            ` : ''}
            
            <div class="card-section">
              <div class="card-label">Current Card</div>
              <game-card 
                .card=${this.game.currentCard}
                .faceDown=${!this.isGameActive}
              ></game-card>
            </div>
          </div>

          ${this.resultMessage ? html`
            <div class="result-message ${this.resultClass}">
              ${this.resultMessage}
            </div>
          ` : ''}

          <game-controls
            .gameStarted=${this.isGameActive}
            .disabled=${this.game.gameOver}
            @game-start=${this._handleStart}
            @game-guess=${this._handleGuess}
          ></game-controls>
        </main>

        ${this.game.gameOver ? html`
          <div class="game-over">
            <div class="game-over-content">
              <h2>Game Over!</h2>
              <div class="final-stats">
                <p>Final Score: <strong>${this.game.score}</strong></p>
                <p>Rounds Survived: <strong>${this.game.round}</strong></p>
                <p>Best Streak: <strong>${this.game.maxStreak}</strong></p>
              </div>
              <button class="restart-btn" @click=${this._handleRestart}>
                Play Again
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _handleStart() {
    this.game.startNewGame();
    this.isGameActive = true;
    this.resultMessage = '';
    this.requestUpdate();
  }

  private _handleGuess(e: CustomEvent) {
    const { guess } = e.detail as { guess: PlayerGuess };
    const result = this.game.makeGuess(guess);

    if (result.correct) {
      this.resultMessage = `✓ Correct! ${guess === 'up' ? 'Higher' : guess === 'down' ? 'Lower' : 'Equal'}!`;
      this.resultClass = 'correct';
    } else {
      this.resultMessage = `✗ Wrong! It was ${result.nextCard?.getDisplayValue() || '?'}`;
      this.resultClass = 'wrong';
      
      setTimeout(() => {
        this.isGameActive = false;
        this.requestUpdate();
      }, 2000);
    }

    this.requestUpdate();

    if (result.correct && !this.game.gameOver) {
      setTimeout(() => {
        this.resultMessage = '';
        this.requestUpdate();
      }, 1500);
    }
  }

  private _handleRestart() {
    this.game.gameOver = false;
    this._handleStart();
  }

  private _setupKeyboardControls() {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'u' && !this.isGameActive) {
        this._handleStart();
      } else if (e.key.toLowerCase() === 'd' && this.isGameActive) {
        this._stopGame();
      }
    });
  }

  private _stopGame() {
    this.isGameActive = false;
    this.game.gameOver = true;
    this.resultMessage = '🛑 Game stopped by player';
    this.resultClass = 'stopped';
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-board': GameBoard;
  }
}

