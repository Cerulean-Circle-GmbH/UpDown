export interface SpecialCardInfo {
  id: string;
  name: string;
  emoji: string;
  level: 1 | 2 | 3;
  description: string;
  targetType: 'self' | 'other' | 'all';
}

export const SPECIAL_CARD_CATALOG: SpecialCardInfo[] = [
  { id: 'protective_shell', name: 'Shield', emoji: '🛡️', level: 1, description: 'Survive this round no matter what.', targetType: 'self' },
  { id: 'mass_intelligence', name: 'Mass Intel', emoji: '🧠', level: 1, description: 'Survive if more than 50% of players guess correctly.', targetType: 'self' },
  { id: 'double_points', name: '2x Points', emoji: '💰', level: 1, description: 'Double your points this round if correct.', targetType: 'self' },
  { id: 'peek', name: 'Peek', emoji: '👁️', level: 1, description: 'See one random card from the GM hand before guessing.', targetType: 'self' },
  { id: 'sacrifice', name: 'Sacrifice', emoji: '💀', level: 2, description: 'Eliminate a target player this round.', targetType: 'other' },
  { id: 'swap', name: 'Swap', emoji: '🔄', level: 2, description: 'Swap your guess result with another player.', targetType: 'other' },
  { id: 'reveal_hand', name: 'Reveal', emoji: '🃏', level: 2, description: 'All players see the GM full hand this round.', targetType: 'all' },
  { id: 'freeze', name: 'Freeze', emoji: '🧊', level: 2, description: 'Target player cannot play next round.', targetType: 'other' },
  { id: 'one_for_the_team', name: 'Team Save', emoji: '🤝', level: 3, description: 'If eliminated, all other players survive too.', targetType: 'all' },
  { id: 'second_chance', name: '2nd Chance', emoji: '🔮', level: 3, description: 'If eliminated, return next round (once per game).', targetType: 'self' },
  { id: 'point_steal', name: 'Steal', emoji: '🏴‍☠️', level: 3, description: 'Steal 20 points from a target player.', targetType: 'other' },
];

export const CARD_INFO_MAP: Record<string, SpecialCardInfo> = Object.fromEntries(SPECIAL_CARD_CATALOG.map(c => [c.id, c]));
