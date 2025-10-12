/**
 * GameCard - Lit web component for displaying a playing card
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Card as CardModel, Suit } from '../Card.ts';

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

    .card {
      width: 120px;
      height: 168px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      font-weight: bold;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }

    .card-back {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 3rem;
    }

    .card-value {
      font-size: 3rem;
      line-height: 1;
    }

    .card-suit {
      font-size: 2rem;
      margin-top: 0.5rem;
    }

    .hearts, .diamonds {
      color: #e53e3e;
    }

    .spades, .clubs {
      color: #2d3748;
    }

    .card.empty {
      background: rgba(255, 255, 255, 0.1);
      border: 2px dashed rgba(255, 255, 255, 0.3);
      box-shadow: none;
    }

    @media (max-width: 768px) {
      .card {
        width: 100px;
        height: 140px;
        font-size: 3rem;
      }

      .card-value {
        font-size: 2.5rem;
      }

      .card-suit {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .card {
        width: 70px;
        height: 98px;
        font-size: 2rem;
      }

      .card-value {
        font-size: 1.8rem;
      }

      .card-suit {
        font-size: 1.2rem;
      }
    }
  `;

  render() {
    if (!this.card) {
      return html`<div class="card empty"></div>`;
    }

    if (this.faceDown) {
      return html`<div class="card card-back">?</div>`;
    }

    const suitClass = this.getSuitClass(this.card.suit);
    const displayValue = this.card.getDisplayValue();

    return html`
      <div class="card ${suitClass}">
        <div class="card-value">${displayValue}</div>
        <div class="card-suit">${this.card.suit}</div>
      </div>
    `;
  }

  private getSuitClass(suit: Suit): string {
    if (suit === '♥' || suit === '♦') return 'hearts';
    return 'spades';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-card': GameCard;
  }
}

