/**
 * KeyboardShortcuts - Lit web component for interactive keyboard shortcut display
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('keyboard-shortcuts')
export class KeyboardShortcuts extends LitElement {
  @property({ type: Boolean })
  gameActive: boolean = false;

  static styles = css`
    :host {
      display: block;
    }

    .keyboard-shortcuts {
      margin-top: 8px;
      color: #666;
      font-size: 0.75rem;
      text-align: center;
      user-select: none;
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
      cursor: pointer;
      display: inline-block;
      transition: all 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }

    kbd:hover {
      background: #e8e8e8;
      transform: translateY(-1px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    }

    kbd:active {
      transform: translateY(1px);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 480px) {
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
    if (this.gameActive) {
      return html`
        <div class="keyboard-shortcuts">
          <small>
            <kbd @click=${() => this._simulateKey('ArrowUp')} @touchend=${(e: TouchEvent) => this._handleTouch(e, 'ArrowUp')}>↑</kbd> Higher • 
            <kbd @click=${() => this._simulateKey('ArrowDown')} @touchend=${(e: TouchEvent) => this._handleTouch(e, 'ArrowDown')}>↓</kbd> Lower • 
            <kbd @click=${() => this._simulateKey('ArrowLeft')} @touchend=${(e: TouchEvent) => this._handleTouch(e, 'ArrowLeft')}>←</kbd> 
            <kbd @click=${() => this._simulateKey('ArrowRight')} @touchend=${(e: TouchEvent) => this._handleTouch(e, 'ArrowRight')}>→</kbd> Equal • 
            <kbd @click=${() => this._simulateKey('d')} @touchend=${(e: TouchEvent) => this._handleTouch(e, 'd')}>D</kbd> Stop
          </small>
        </div>
      `;
    }

    return html`
      <div class="keyboard-shortcuts">
        <small>
          Keyboard: 
          <kbd @click=${() => this._simulateKey('u')} @touchend=${(e: TouchEvent) => this._handleTouch(e, 'u')}>U</kbd> = Start • 
          <kbd @click=${() => this._simulateKey('d')} @touchend=${(e: TouchEvent) => this._handleTouch(e, 'd')}>D</kbd> = Stop
        </small>
      </div>
    `;
  }

  private _handleTouch(e: TouchEvent, key: string) {
    e.preventDefault(); // Prevent double-firing with click event
    this._simulateKey(key);
  }

  private _simulateKey(key: string) {
    // Dispatch a real keyboard event that will be caught by the game's keyboard listener
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'keyboard-shortcuts': KeyboardShortcuts;
  }
}

