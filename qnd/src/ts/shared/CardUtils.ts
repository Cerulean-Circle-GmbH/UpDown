const SUIT_SYMBOLS: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

export function suitSymbol(suit: string): string {
  return SUIT_SYMBOLS[suit] || suit;
}

export function cardColor(suit: string): 'red' | 'black' {
  return (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
}

export function cardToHtml(card: { suit: string; value: string }, size: 'normal' | 'small' = 'normal'): string {
  const cls = size === 'small' ? 'playing-card playing-card-sm' : 'playing-card';
  return `<div class="${cls} ${cardColor(card.suit)}"><span class="card-value">${card.value}</span><span class="card-suit">${suitSymbol(card.suit)}</span></div>`;
}

export function cardText(card: { suit: string; value: string }): string {
  return `${card.value}${suitSymbol(card.suit)}`;
}
