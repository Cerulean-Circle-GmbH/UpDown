/**
 * GameStats - Lit web component for displaying game statistics
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('game-stats')
export class GameStats extends LitElement {
  @property({ type: Number })
  round: number = 0;

  @property({ type: Number })
  score: number = 0;

  @property({ type: Number })
  streak: number = 0;

  @property({ type: Number })
  cardsLeft: number = 52;

  static styles = css`
    :host {
      display: block;
    }

    .stats {
      display: flex;
      justify-content: space-around;
      gap: 5px;
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
    }

    .stat-label {
      font-size: 0.65rem;
      opacity: 0.9;
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 1rem;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .stat-label {
        font-size: 0.7rem;
      }

      .stat-value {
        font-size: 1.2rem;
      }
    }

    @media (max-width: 480px) {
      .stats {
        gap: 3px;
      }

      .stat {
        min-width: 50px;
      }

      .stat-label {
        font-size: 0.6rem;
      }

      .stat-value {
        font-size: 0.9rem;
      }
    }

    @media (orientation: landscape) {
      .stats {
        gap: 8px;
      }

      .stat {
        min-width: 70px;
      }

      .stat-label {
        font-size: 0.65rem;
      }

      .stat-value {
        font-size: 1rem;
      }
    }

    @media (orientation: landscape) and (max-height: 500px) {
      .stats {
        gap: 5px;
      }

      .stat {
        min-width: 55px;
      }

      .stat-label {
        font-size: 0.55rem;
      }

      .stat-value {
        font-size: 0.85rem;
      }
    }
  `;

  render() {
    return html`
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Round</span>
          <span class="stat-value">${this.round}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Score</span>
          <span class="stat-value">${this.score}</span>
        </div>
        <div class="stat ${this.streak > 0 ? 'highlight' : ''}">
          <span class="stat-label">Streak</span>
          <span class="stat-value">${this.streak}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Cards Left</span>
          <span class="stat-value">${this.cardsLeft}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-stats': GameStats;
  }
}

