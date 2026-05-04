/**
 * SpecialCards — Card definitions and effect resolution
 * QnD Sprint 3: Implements spec Level 1/2/3 cards with priority system
 */

export interface SpecialCardDef {
  id: string;
  name: string;
  description: string;
  level: 1 | 2 | 3;
  emoji: string;
  targetType: 'self' | 'other' | 'all';
}

export const SPECIAL_CARDS: SpecialCardDef[] = [
  // Level 1: Low impact, one round, self only
  {
    id: 'protective_shell',
    name: 'Protective Shell',
    description: 'Survive this round no matter what.',
    level: 1, emoji: '🛡️', targetType: 'self'
  },
  {
    id: 'mass_intelligence',
    name: 'Mass Intelligence',
    description: 'Survive if more than 50% of players guess correctly.',
    level: 1, emoji: '🧠', targetType: 'self'
  },
  {
    id: 'double_points',
    name: 'Double Points',
    description: 'Double your points this round if correct.',
    level: 1, emoji: '💰', targetType: 'self'
  },
  {
    id: 'peek',
    name: 'Peek',
    description: 'See one random card from the GM hand before guessing.',
    level: 1, emoji: '👁️', targetType: 'self'
  },

  // Level 2: Can target others, one round
  {
    id: 'sacrifice',
    name: 'Sacrifice',
    description: 'Eliminate a target player this round (even if they guessed right).',
    level: 2, emoji: '💀', targetType: 'other'
  },
  {
    id: 'swap',
    name: 'Swap',
    description: 'Swap your guess result with another player.',
    level: 2, emoji: '🔄', targetType: 'other'
  },
  {
    id: 'reveal_hand',
    name: 'Reveal Hand',
    description: 'All players see the GM full hand this round.',
    level: 2, emoji: '🃏', targetType: 'all'
  },
  {
    id: 'freeze',
    name: 'Freeze',
    description: 'Target player cannot play a card next round.',
    level: 2, emoji: '🧊', targetType: 'other'
  },

  // Level 3: Multi-round or multi-player, high impact
  {
    id: 'one_for_the_team',
    name: 'One for the Team',
    description: 'If you are eliminated, all other players survive this round too.',
    level: 3, emoji: '🤝', targetType: 'all'
  },
  {
    id: 'second_chance',
    name: 'Second Chance',
    description: 'If eliminated, return to the game next round (once per game).',
    level: 3, emoji: '🔮', targetType: 'self'
  },
  {
    id: 'point_steal',
    name: 'Point Steal',
    description: 'Steal 20 points from a target player.',
    level: 3, emoji: '🏴‍☠️', targetType: 'other'
  },
];

export interface PlayedSpecialCard {
  cardId: string;
  playerId: string;
  targetPlayerId?: string;
}

export interface EffectResult {
  playerId: string;
  effect: string;
  message: string;
}

/**
 * Resolve special card effects in priority order (Level 3 first, then 2, then 1)
 * Returns modifications to player state
 */
// [uc:uuid:fb209fdd] UC-SC12: special.priorityOrder — [uc:uuid:4af9fb90] UC-RD6: round.resolve.specials
export function resolveSpecialCards(
  playedCards: PlayedSpecialCard[],
  playerResults: Map<string, { correct: boolean; alive: boolean; score: number }>,
  gmHand: { value: string; suit: string }[],
  totalPlayers: number
): EffectResult[] {
  const effects: EffectResult[] = [];

  // Sort by level descending (highest priority first)
  const sorted = [...playedCards].sort((a, b) => {
    const cardA = SPECIAL_CARDS.find(c => c.id === a.cardId);
    const cardB = SPECIAL_CARDS.find(c => c.id === b.cardId);
    return (cardB?.level || 0) - (cardA?.level || 0);
  });

  // Track which effects have been applied (no stacking)
  const appliedEffects = new Set<string>();

  for (const played of sorted) {
    const card = SPECIAL_CARDS.find(c => c.id === played.cardId);
    if (!card) continue;

    // No stacking: identical cards only take effect once
    if (appliedEffects.has(played.cardId)) continue;
    appliedEffects.add(played.cardId);

    const playerState = playerResults.get(played.playerId);
    if (!playerState) continue;

    switch (played.cardId) {
      case 'protective_shell': { // [uc:uuid:58aca2aa] UC-SC1
        playerState.alive = true;
        effects.push({ playerId: played.playerId, effect: 'protected', message: `${card.emoji} Protective Shell — survived!` });
        break;
      }

      case 'mass_intelligence': { // [uc:uuid:725f1f43] UC-SC11
        const correctCount = [...playerResults.values()].filter(p => p.correct).length;
        if (correctCount > totalPlayers / 2) {
          playerState.alive = true;
          effects.push({ playerId: played.playerId, effect: 'mass_saved', message: `${card.emoji} Mass Intelligence — majority correct, you survive!` });
        } else {
          effects.push({ playerId: played.playerId, effect: 'mass_failed', message: `${card.emoji} Mass Intelligence — not enough correct guesses.` });
        }
        break;
      }

      case 'double_points': { // [uc:uuid:fc29d64c] UC-SC2
        if (playerState.correct) {
          playerState.score *= 2;
          effects.push({ playerId: played.playerId, effect: 'doubled', message: `${card.emoji} Double Points — score doubled!` });
        }
        break;
      }

      case 'peek': { // [uc:uuid:7c992d5a] UC-SC3
        if (gmHand.length > 0) {
          const peekCard = gmHand[Math.floor(Math.random() * gmHand.length)];
          effects.push({ playerId: played.playerId, effect: 'peek', message: `${card.emoji} Peek — GM has a ${peekCard.value} of ${peekCard.suit}` });
        }
        break;
      }

      case 'sacrifice': { // [uc:uuid:994dc326] UC-SC4
        if (played.targetPlayerId) {
          const target = playerResults.get(played.targetPlayerId);
          if (target) {
            target.alive = false;
            effects.push({ playerId: played.targetPlayerId, effect: 'sacrificed', message: `${card.emoji} Sacrifice — eliminated by ${played.playerId}!` });
          }
        }
        break;
      }

      case 'swap': { // [uc:uuid:288df581] UC-SC5
        if (played.targetPlayerId) {
          const target = playerResults.get(played.targetPlayerId);
          if (target) {
            const tempCorrect = playerState.correct;
            const tempAlive = playerState.alive;
            playerState.correct = target.correct;
            playerState.alive = target.alive;
            target.correct = tempCorrect;
            target.alive = tempAlive;
            effects.push({ playerId: played.playerId, effect: 'swapped', message: `${card.emoji} Swap — results swapped!` });
          }
        }
        break;
      }

      case 'reveal_hand': { // [uc:uuid:c11e9372] UC-SC6
        const handStr = gmHand.map(c => `${c.value}${c.suit[0].toUpperCase()}`).join(', ');
        effects.push({ playerId: played.playerId, effect: 'revealed', message: `${card.emoji} Reveal — GM hand: ${handStr}` });
        break;
      }

      case 'freeze': { // [uc:uuid:872c8b2b] UC-SC7
        if (played.targetPlayerId) {
          effects.push({ playerId: played.targetPlayerId, effect: 'frozen', message: `${card.emoji} Freeze — cannot play next round!` });
        }
        break;
      }

      case 'one_for_the_team': { // [uc:uuid:5c153b82] UC-SC8
        if (!playerState.alive) {
          // Player died, so everyone else survives
          playerResults.forEach((state) => { state.alive = true; });
          effects.push({ playerId: played.playerId, effect: 'team_save', message: `${card.emoji} One for the Team — everyone survives!` });
        }
        break;
      }

      case 'second_chance': { // [uc:uuid:7ed5c89e] UC-SC9
        if (!playerState.alive) {
          playerState.alive = true;
          effects.push({ playerId: played.playerId, effect: 'revived', message: `${card.emoji} Second Chance — back in the game!` });
        }
        break;
      }

      case 'point_steal': { // [uc:uuid:47b2e416] UC-SC10
        if (played.targetPlayerId) {
          const target = playerResults.get(played.targetPlayerId);
          if (target) {
            const stolen = Math.min(20, target.score);
            target.score -= stolen;
            playerState.score += stolen;
            effects.push({ playerId: played.playerId, effect: 'stole', message: `${card.emoji} Point Steal — stole ${stolen} points!` });
          }
        }
        break;
      }
    }
  }

  return effects;
}
