/**
 * GameBoard - Main Lit web component that orchestrates the game
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { GameModel, PlayerGuess } from '../GameModel.js';
import './game-card.js';
import './game-stats.js';
import './game-controls.js';
import './keyboard-shortcuts.js';

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

  private lastTapTime: number = 0;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .game-container {
      width: 100%;
      max-width: 800px;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin: 0 auto;
    }

    .game-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px;
      text-align: center;
      flex-shrink: 0;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }

    .game-header::before {
      content: '⟲';
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      cursor: pointer;
      z-index: 10;
      padding: 10px;
      margin: -10px;
    }

    .game-header::before:hover,
    .game-header::before:active {
      opacity: 1;
      transform: translateY(-50%) rotate(180deg);
    }

    .game-header::after {
      content: '⛶';
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
      font-size: 1.2rem;
      transition: opacity 0.3s ease;
      z-index: 10;
    }

    .game-header:hover::after {
      opacity: 1;
    }

    .game-header:active {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4290 100%);
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: 8px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      font-weight: bold;
    }

    .game-board-content {
      padding: 15px 8px;
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      overflow: hidden;
      min-height: 0;
      transition: all 0.3s ease;
    }

    .cards-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .card-label {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .choices {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: nowrap;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .choice-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px 20px;
      font-size: 0.9rem;
      font-weight: bold;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 90px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .choice-btn:hover:not(:disabled) {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .choice-btn:active:not(:disabled) {
      transform: translateY(-2px);
    }

    .choice-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .choice-icon {
      font-size: 2rem;
      margin-bottom: 5px;
    }

    .choice-label {
      font-size: 0.9rem;
    }

    .down-btn {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
    }

    .equal-btn {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
      color: white;
    }

    .up-btn {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
    }

    .game-controls {
      text-align: center;
      flex-shrink: 0;
    }

    .start-btn {
      padding: 12px 30px;
      font-size: 1.1rem;
      font-weight: bold;
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .start-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .start-btn[hidden] {
      display: none;
    }

    .result-message {
      text-align: center;
      min-height: 30px;
      font-size: 1rem;
      font-weight: bold;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .result-message.correct {
      color: #27ae60;
      animation: bounceIn 0.5s ease;
    }

    .result-message.wrong {
      color: #e74c3c;
      animation: shakeIt 0.5s ease;
    }

    .result-message.stopped {
      color: #f39c12;
      animation: bounceIn 0.5s ease;
    }

    .game-over {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 20px;
    }

    .game-over.hidden {
      display: none;
    }

    .game-over-content {
      background: white;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      max-width: 280px;
    }

    .game-over h2 {
      font-size: 1.5rem;
      color: #e74c3c;
      margin-bottom: 15px;
    }

    .final-stats {
      margin-bottom: 15px;
      font-size: 0.85rem;
      line-height: 1.6;
    }

    .final-stats strong {
      color: #667eea;
      font-size: 1.1rem;
    }

    .restart-btn {
      padding: 12px 30px;
      font-size: 1.1rem;
      font-weight: bold;
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .restart-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    @keyframes bounceIn {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-20px);
      }
      60% {
        transform: translateY(-10px);
      }
    }

    @keyframes shakeIt {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-10px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(10px);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .game-container {
        max-width: 100%;
        border-radius: 0;
        height: 100vh;
        height: 100dvh;
      }

      .game-header h1 {
        font-size: 1.8rem;
        margin-bottom: 8px;
      }

      .game-header::before {
        left: 10px;
        font-size: 1rem;
      }

      .game-header::after {
        right: 10px;
        font-size: 1rem;
      }
    }

    /* iPhone 4 and very small screens */
    @media (max-width: 480px) {
      .game-header {
        padding: 8px;
      }

      .game-header h1 {
        font-size: 1.3rem;
        margin-bottom: 5px;
      }

      .game-board-content {
        padding: 8px 5px;
      }

      .card-label {
        font-size: 0.65rem;
        margin-bottom: 2px;
      }

      .result-message {
        min-height: 20px;
        font-size: 0.8rem;
      }

      .choices {
        gap: 4px;
      }

      .choice-btn {
        min-width: 65px;
        padding: 8px 10px;
        font-size: 0.65rem;
      }

      .choice-icon {
        font-size: 1.3rem;
        margin-bottom: 2px;
      }

      .choice-label {
        font-size: 0.65rem;
      }

      .start-btn {
        padding: 10px 20px;
        font-size: 0.9rem;
      }

      .game-over-content {
        padding: 15px;
        max-width: 260px;
      }

      .game-over h2 {
        font-size: 1.3rem;
        margin-bottom: 10px;
      }

      .final-stats {
        font-size: 0.8rem;
        margin-bottom: 10px;
      }

      .final-stats strong {
        font-size: 1rem;
      }
    }

    /* Landscape mode - Horizontal Layout */
    @media (orientation: landscape) {
      .game-header h1 {
        font-size: 1.3rem;
        margin-bottom: 5px;
      }

      .game-header::before {
        font-size: 1rem;
        left: 10px;
      }

      .game-header::after {
        font-size: 1rem;
        right: 10px;
      }

      .game-board-content {
        padding: 10px;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-template-rows: auto 1fr auto auto;
        gap: 10px;
        align-items: center;
        height: 100%;
      }

      .result-message {
        grid-column: 1 / 4;
        grid-row: 1;
        min-height: 25px;
        font-size: 0.9rem;
      }

      .cards-container {
        grid-column: 1 / 3;
        grid-row: 2;
        flex-direction: row;
        gap: 10px;
        justify-self: center;
        align-self: center;
      }

      .choices {
        grid-column: 3;
        grid-row: 2;
        flex-direction: column;
        gap: 8px;
        justify-self: center;
        align-self: center;
      }

      /* Reverse button order in landscape: Higher at top, Lower at bottom */
      .choices .up-btn {
        order: 1;
      }

      .choices .equal-btn {
        order: 2;
      }

      .choices .down-btn {
        order: 3;
      }

      .choice-btn {
        min-width: 100px;
        padding: 12px 18px;
      }

      .game-controls {
        grid-column: 1 / 4;
        grid-row: 4;
        align-self: start;
      }

      .start-btn {
        padding: 10px 25px;
        font-size: 1rem;
      }

      /* Previous card darker */
      .previous-card-section {
        opacity: 0.7;
      }
    }

    /* Landscape on small screens */
    @media (orientation: landscape) and (max-height: 500px) {
      .game-header {
        padding: 5px;
      }

      .game-header h1 {
        font-size: 1.1rem;
        margin-bottom: 3px;
      }

      .game-header::before {
        font-size: 0.85rem;
        left: 8px;
      }

      .game-header::after {
        font-size: 0.85rem;
        right: 8px;
      }

      .game-board-content {
        padding: 5px;
        gap: 5px;
      }

      .cards-container {
        gap: 10px;
      }

      .card-label {
        font-size: 0.6rem;
        margin-bottom: 2px;
      }

      .result-message {
        min-height: 20px;
        font-size: 0.75rem;
      }

      .choice-btn {
        min-width: 80px;
        padding: 8px 12px;
        font-size: 0.75rem;
      }

      .choice-icon {
        font-size: 1.5rem;
        margin-bottom: 3px;
      }

      .choice-label {
        font-size: 0.75rem;
      }

      .start-btn {
        padding: 8px 20px;
        font-size: 0.85rem;
      }

      .game-over-content {
        padding: 12px;
        max-width: 240px;
      }

      .game-over h2 {
        font-size: 1.1rem;
        margin-bottom: 8px;
      }

      .final-stats {
        font-size: 0.7rem;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .final-stats strong {
        font-size: 0.9rem;
      }

      /* Previous card darker */
      .previous-card-section {
        opacity: 0.7;
      }
    }

    /* Keyboard hints */
    .keyboard-hint {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease;
    }

    .keyboard-hint.fade-out {
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.3s ease;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* iOS Fullscreen Instructions Overlay */
    .ios-fullscreen-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 20000;
      animation: fadeIn 0.3s ease;
      padding: 20px;
    }

    .ios-fullscreen-overlay.fade-out {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .ios-fullscreen-content {
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      text-align: left;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    .ios-fullscreen-content h3 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #667eea;
      text-align: center;
    }

    .ios-fullscreen-content p {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 15px;
      color: #333;
    }

    .ios-fullscreen-content ol {
      margin: 15px 0;
      padding-left: 25px;
      color: #333;
    }

    .ios-fullscreen-content ol li {
      margin: 10px 0;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .ios-fullscreen-content strong {
      color: #667eea;
      font-weight: 600;
    }

    .ios-fullscreen-content small {
      color: #666;
      font-size: 0.85rem;
    }

    .ios-close-btn {
      width: 100%;
      padding: 12px;
      margin-top: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .ios-close-btn:active {
      transform: scale(0.95);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._setupKeyboardControls();
    this._setupHeaderInteractions();
  }

  render() {
    return html`
      <div class="game-container">
        <header class="game-header" @click=${this._handleHeaderClick} @touchend=${this._handleHeaderTouch}>
          <h1>🎴 UpDown</h1>
          <game-stats
            .round=${this.game.round}
            .score=${this.game.score}
            .streak=${this.game.streak}
            .cardsLeft=${this.game.cardsLeft}
          ></game-stats>
        </header>

        <main class="game-board-content">
          <div class="cards-container">
            ${this.game.previousCard ? html`
              <div class="card-section previous-card-section">
                <div class="card-label">Previous</div>
                <game-card .card=${this.game.previousCard}></game-card>
              </div>
            ` : ''}
            
            <div class="card-section current-card-section">
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
          ` : html`<div class="result-message"></div>`}

          <!-- Player choices (always in DOM, like JS version) -->
          <div class="choices">
            <button class="choice-btn down-btn" ?disabled=${!this.isGameActive} @click=${() => this._handleGuess({detail: {guess: 'down'}})}>
              <span class="choice-icon">⬇</span>
              <span class="choice-label">Lower</span>
            </button>
            <button class="choice-btn equal-btn" ?disabled=${!this.isGameActive} @click=${() => this._handleGuess({detail: {guess: 'equal'}})}>
              <span class="choice-icon">=</span>
              <span class="choice-label">Equal</span>
            </button>
            <button class="choice-btn up-btn" ?disabled=${!this.isGameActive} @click=${() => this._handleGuess({detail: {guess: 'up'}})}>
              <span class="choice-icon">⬆</span>
              <span class="choice-label">Higher</span>
            </button>
          </div>

          <!-- Start/Game controls (always in DOM, like JS version) -->
          <div class="game-controls">
            <button class="start-btn" ?hidden=${this.isGameActive} @click=${this._handleStart}>Start Game</button>
            <keyboard-shortcuts .gameActive=${this.isGameActive}></keyboard-shortcuts>
          </div>
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
      const key = e.key.toLowerCase();
      
      // Start/Stop game
      if (key === 'u') {
        if (!this.isGameActive) {
          e.preventDefault();
          this._handleStart();
          this._showKeyboardHint('🎮 Game Up! Starting...');
        }
      }
      
      if (key === 'd') {
        if (this.isGameActive) {
          e.preventDefault();
          this._stopGame();
          this._showKeyboardHint('🛑 Game Down! Stopping...');
        }
      }
      
      // Arrow keys for gameplay (only when game is active and not disabled)
      if (this.isGameActive && !this.game.gameOver) {
        if (key === 'arrowup') {
          e.preventDefault();
          this._handleGuess({detail: {guess: 'up'}});
        } else if (key === 'arrowdown') {
          e.preventDefault();
          this._handleGuess({detail: {guess: 'down'}});
        } else if (key === 'arrowleft' || key === 'arrowright') {
          e.preventDefault();
          this._handleGuess({detail: {guess: 'equal'}});
        }
      }
    });
  }

  private _setupHeaderInteractions() {
    // Header interactions are handled in render with @click and @touchend
  }

  private _handleHeaderClick(e: MouseEvent) {
    const header = e.currentTarget as HTMLElement;
    const rect = header.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    // Reload button area (left 60px)
    if (clickX < 60) {
      e.preventDefault();
      this._reloadGame();
      return;
    }
    
    // Double-click for fullscreen (rest of header)
    const currentTime = Date.now();
    const tapGap = currentTime - this.lastTapTime;
    
    if (tapGap < 300 && tapGap > 0) {
      e.preventDefault();
      this._toggleFullscreen();
    }
    
    this.lastTapTime = currentTime;
  }

  private _handleHeaderTouch(e: TouchEvent) {
    const header = e.currentTarget as HTMLElement;
    const rect = header.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const clickX = touch.clientX - rect.left;
    
    // Reload button area (left 60px)
    if (clickX < 60) {
      e.preventDefault();
      this._reloadGame();
      return;
    }
    
    // Double-tap for fullscreen
    const currentTime = Date.now();
    const tapGap = currentTime - this.lastTapTime;
    
    if (tapGap < 300 && tapGap > 0) {
      e.preventDefault();
      this._toggleFullscreen();
    }
    
    this.lastTapTime = currentTime;
  }

  private _reloadGame() {
    if (this.isGameActive) {
      if (confirm('Reload game? Your current progress will be lost.')) {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  }

  private _toggleFullscreen() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Check if already in standalone mode
      if ((window.navigator as any).standalone) {
        this._showKeyboardHint('📱 Already in App Mode');
        return;
      }
      
      // Show iOS fullscreen instructions
      this._showIOSFullscreenInstructions();
      return;
    }
    
    // Standard fullscreen for other browsers
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Fullscreen error: ${err.message}`);
        if (isIOS) {
          this._showIOSFullscreenInstructions();
        }
      });
      this._showKeyboardHint('📱 Fullscreen Mode');
    } else {
      document.exitFullscreen();
      this._showKeyboardHint('🖥️ Exited Fullscreen');
    }
  }

  private _showKeyboardHint(message: string) {
    const hint = document.createElement('div');
    hint.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;
    hint.textContent = message;
    document.body.appendChild(hint);
    
    setTimeout(() => {
      hint.style.opacity = '0';
      hint.style.transform = 'translateX(20px)';
      hint.style.transition = 'all 0.3s ease';
      setTimeout(() => hint.remove(), 300);
    }, 1500);
  }

  private _showIOSFullscreenInstructions() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 20000;
      animation: fadeIn 0.3s ease;
      padding: 20px;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        text-align: left;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      ">
        <h3 style="
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #667eea;
          text-align: center;
        ">📱 iOS Fullscreen Mode</h3>
        <p style="
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 15px;
          color: #333;
        ">For the best fullscreen experience on iPhone:</p>
        <ol style="
          margin: 15px 0;
          padding-left: 25px;
          color: #333;
        ">
          <li style="margin: 10px 0; line-height: 1.6; font-size: 0.95rem;">
            Tap the <strong style="color: #667eea; font-weight: 600;">Share</strong> button 
            <span style="font-size: 1.5rem;">⎙</span>
          </li>
          <li style="margin: 10px 0; line-height: 1.6; font-size: 0.95rem;">
            Scroll down and tap <strong style="color: #667eea; font-weight: 600;">"Add to Home Screen"</strong>
          </li>
          <li style="margin: 10px 0; line-height: 1.6; font-size: 0.95rem;">
            Open the app from your home screen
          </li>
        </ol>
        <p style="margin-bottom: 15px;">
          <small style="color: #666; font-size: 0.85rem;">Or scroll down in Safari to auto-hide the browser bars</small>
        </p>
        <button class="ios-close-btn" style="
          width: 100%;
          padding: 12px;
          margin-top: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">Got it!</button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Close button handler
    const closeBtn = overlay.querySelector('.ios-close-btn') as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
      });
      closeBtn.addEventListener('mousedown', () => {
        closeBtn.style.transform = 'scale(0.95)';
      });
      closeBtn.addEventListener('mouseup', () => {
        closeBtn.style.transform = 'scale(1)';
      });
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
      }
    });
    
    // Auto-scroll to hide Safari UI
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);
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

