/**
 * GameControls - Lit web component for game control buttons
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type GuessType = 'up' | 'down' | 'equal';

@customElement('game-controls')
export class GameControls extends LitElement {
  @property({ type: Boolean })
  disabled: boolean = false;

  @property({ type: Boolean })
  gameStarted: boolean = false;

  static styles = css`
    :host {
      display: block;
    }

    .controls-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
    }

    .choices {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
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

    .keyboard-shortcuts {
      margin-top: 8px;
      color: #666;
      font-size: 0.75rem;
      text-align: center;
    }

    kbd {
      background: #f4f4f4;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 2px 6px;
      font-family: monospace;
      font-weight: bold;
      font-size: 0.75rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 480px) {
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

      .keyboard-shortcuts {
        font-size: 0.55rem;
        margin-top: 5px;
      }

      kbd {
        font-size: 0.55rem;
        padding: 1px 3px;
      }
    }

    @media (orientation: landscape) {
      .choices {
        flex-direction: column;
        gap: 8px;
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

      .start-btn {
        padding: 10px 25px;
        font-size: 1rem;
      }

      .keyboard-shortcuts {
        font-size: 0.65rem;
        margin-top: 5px;
      }

      kbd {
        font-size: 0.65rem;
        padding: 1px 4px;
      }
    }

    @media (orientation: landscape) and (max-height: 500px) {
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

      .keyboard-shortcuts {
        font-size: 0.55rem;
        margin-top: 3px;
      }

      kbd {
        font-size: 0.55rem;
        padding: 1px 3px;
      }
    }
  `;

  render() {
    if (!this.gameStarted) {
      return html`
        <div class="controls-container">
          <button class="start-btn" @click=${this._handleStart}>
            Start Game
          </button>
          <div class="keyboard-shortcuts">
            <small>Keyboard: <kbd>U</kbd> = Start • <kbd>D</kbd> = Stop</small>
          </div>
        </div>
      `;
    }

    return html`
      <div class="choices">
        <button
          class="choice-btn down-btn"
          ?disabled=${this.disabled}
          @click=${() => this._handleGuess('down')}
        >
          <span class="choice-icon">⬇</span>
          <span class="choice-label">Lower</span>
        </button>
        <button
          class="choice-btn equal-btn"
          ?disabled=${this.disabled}
          @click=${() => this._handleGuess('equal')}
        >
          <span class="choice-icon">=</span>
          <span class="choice-label">Equal</span>
        </button>
        <button
          class="choice-btn up-btn"
          ?disabled=${this.disabled}
          @click=${() => this._handleGuess('up')}
        >
          <span class="choice-icon">⬆</span>
          <span class="choice-label">Higher</span>
        </button>
      </div>
    `;
  }

  private _handleStart() {
    this.dispatchEvent(new CustomEvent('game-start', {
      bubbles: true,
      composed: true
    }));
  }

  private _handleGuess(guess: GuessType) {
    this.dispatchEvent(new CustomEvent('game-guess', {
      detail: { guess },
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-controls': GameControls;
  }
}

