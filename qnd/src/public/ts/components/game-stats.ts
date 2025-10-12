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
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      min-width: 80px;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .stat.highlight {
      background: rgba(255, 255, 255, 0.2);
      animation: pulse 0.5s ease;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @media (max-width: 768px) {
      .stats {
        gap: 1rem;
      }

      .stat {
        min-width: 70px;
        padding: 0.4rem 0.8rem;
      }

      .stat-label {
        font-size: 0.65rem;
      }

      .stat-value {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .stats {
        gap: 0.5rem;
      }

      .stat {
        min-width: 60px;
        padding: 0.3rem 0.6rem;
      }

      .stat-label {
        font-size: 0.6rem;
      }

      .stat-value {
        font-size: 1rem;
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

