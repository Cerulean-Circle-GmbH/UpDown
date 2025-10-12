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
      gap: 0.5rem;
      padding: 1.5rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.95);
      color: #2d3748;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      min-width: 120px;
    }

    .choice-btn:hover:not(:disabled) {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .choice-btn:active:not(:disabled) {
      transform: translateY(-2px);
    }

    .choice-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .choice-btn.up-btn {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;
    }

    .choice-btn.down-btn {
      background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
      color: white;
    }

    .choice-btn.equal-btn {
      background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
      color: white;
    }

    .choice-icon {
      font-size: 2rem;
      line-height: 1;
    }

    .choice-label {
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .start-btn {
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

    .start-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    }

    .keyboard-shortcuts {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    kbd {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .choice-btn {
        padding: 1.25rem 1.5rem;
        min-width: 100px;
      }

      .choice-icon {
        font-size: 1.75rem;
      }

      .choice-label {
        font-size: 0.9rem;
      }

      .start-btn {
        padding: 0.875rem 2rem;
        font-size: 1.1rem;
      }
    }

    @media (max-width: 480px) {
      .choices {
        gap: 0.75rem;
      }

      .choice-btn {
        padding: 1rem 1.25rem;
        min-width: 80px;
      }

      .choice-icon {
        font-size: 1.5rem;
      }

      .choice-label {
        font-size: 0.75rem;
      }

      .start-btn {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
      }
    }

    @media (orientation: landscape) and (max-height: 600px) {
      .choices {
        flex-direction: column;
        gap: 0.5rem;
      }

      .choice-btn {
        flex-direction: row;
        padding: 0.75rem 1.5rem;
        min-width: 200px;
      }

      .up-btn {
        order: 1;
      }

      .equal-btn {
        order: 2;
      }

      .down-btn {
        order: 3;
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

