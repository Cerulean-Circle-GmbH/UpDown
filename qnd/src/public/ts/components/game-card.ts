/**
 * GameCard - Lit web component for displaying a playing card
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Card as CardModel, Suit } from '../Card.js';

@customElement('game-card')
export class GameCard extends LitElement {
  @property({ type: Object })
  card: CardModel | null = null;

  @property({ type: Boolean })
  faceDown: boolean = false;

  static styles = css`
    :host {
      display: block;
    }

    .card-slot {
      width: 120px;
      height: 168px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: bold;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      position: relative;
    }

    .card-slot.empty {
      background: #f0f0f0;
      border: 3px dashed #ccc;
    }

    .card-slot.card {
      background: white;
      border: 3px solid #333;
    }

    .card-slot.red {
      color: #e74c3c;
    }

    .card-slot.black {
      color: #2c3e50;
    }

    .card-value {
      font-size: 3rem;
    }

    .card-suit {
      font-size: 2rem;
      margin-top: -8px;
    }

    .card-back {
      font-size: 4rem;
      color: #999;
    }

    .card-slot.flip-in {
      animation: flipIn 0.5s ease;
    }

    @keyframes flipIn {
      0% {
        transform: rotateY(90deg) scale(0.8);
        opacity: 0;
      }
      100% {
        transform: rotateY(0) scale(1);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .card-slot {
        width: 70px;
        height: 98px;
      }

      .card-value {
        font-size: 1.8rem;
      }

      .card-suit {
        font-size: 1.2rem;
      }

      .card-back {
        font-size: 2.2rem;
      }
    }

    @media (orientation: landscape) {
      .card-slot {
        width: 90px;
        height: 126px;
      }

      .card-value {
        font-size: 2.5rem;
      }

      .card-suit {
        font-size: 1.6rem;
      }

      .card-back {
        font-size: 3rem;
      }
    }

    @media (orientation: landscape) and (max-height: 500px) {
      .card-slot {
        width: 70px;
        height: 98px;
      }

      .card-value {
        font-size: 2rem;
      }

      .card-suit {
        font-size: 1.3rem;
      }

      .card-back {
        font-size: 2.5rem;
      }
    }
  `;

  render() {
    if (!this.card) {
      return html`<div class="card-slot empty"></div>`;
    }

    if (this.faceDown) {
      return html`
        <div class="card-slot empty">
          <div class="card-back">?</div>
        </div>
      `;
    }

    const colorClass = this.card.getColor();
    const displayValue = this.card.getDisplayValue();

    return html`
      <div class="card-slot card ${colorClass} flip-in">
        <div class="card-value">${displayValue}</div>
        <div class="card-suit">${this.card.suit}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-card': GameCard;
  }
}

