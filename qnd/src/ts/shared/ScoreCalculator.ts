export function calculateScore(correct: boolean, streak: number): { score: number; newStreak: number } {
  if (correct) return { score: 10 + streak, newStreak: streak + 1 };
  return { score: 0, newStreak: 0 };
}

export function calculateDiamonds(rank: number, roundsPlayed: number, streak: number): number {
  const rankDiamonds = rank === 1 ? 50 : rank === 2 ? 30 : rank === 3 ? 20 : 0;
  const roundDiamonds = roundsPlayed * 5;
  const streakBonus = streak >= 10 ? 25 : streak >= 5 ? 10 : 0;
  return rankDiamonds + roundDiamonds + streakBonus;
}
