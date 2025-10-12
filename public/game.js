// Game logic - Plain JavaScript for browser
class Card {
  constructor(suit = '♠', value = 2) {
    this.suit = suit;
    this.value = value;
  }
  
  getDisplayValue() {
    switch (this.value) {
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      case 14: return 'A';
      default: return this.value.toString();
    }
  }
  
  getColor() {
    return (this.suit === '♥' || this.suit === '♦') ? 'red' : 'black';
  }
  
  static createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const deck = [];
    
    for (const suit of suits) {
      for (const value of values) {
        deck.push(new Card(suit, value));
      }
    }
    
    return deck;
  }
  
  static shuffle(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

class GameModel {
  constructor() {
    this.deck = [];
    this.currentCard = null;
    this.previousCard = null;
    this.round = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.phase = 'ready';
    this.gameOver = false;
    this.lastResult = null;
  }
  
  startNewGame() {
    this.deck = Card.shuffle(Card.createDeck());
    this.currentCard = this.deck.pop() || null;
    this.previousCard = null;
    this.round = 1;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.phase = 'playing';
    this.gameOver = false;
    this.lastResult = null;
  }
  
  makeGuess(guess) {
    if (!this.currentCard || this.deck.length === 0) {
      this.phase = 'game_over';
      this.gameOver = true;
      return { correct: false, nextCard: null };
    }
    
    const nextCard = this.deck.pop() || null;
    if (!nextCard) {
      this.phase = 'game_over';
      this.gameOver = true;
      return { correct: false, nextCard: null };
    }
    
    let correct = false;
    
    if (guess === 'up') {
      correct = nextCard.value > this.currentCard.value;
    } else if (guess === 'down') {
      correct = nextCard.value < this.currentCard.value;
    } else if (guess === 'equal') {
      correct = nextCard.value === this.currentCard.value;
    }
    
    this.previousCard = this.currentCard;
    this.currentCard = nextCard;
    this.round++;
    
    if (correct) {
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      
      // Base points + streak bonus
      let points = 10;
      if (guess === 'equal') points = 50; // Equal is harder
      
      // Streak multiplier every 5 correct guesses
      const streakMultiplier = Math.floor(this.streak / 5) + 1;
      points *= streakMultiplier;
      
      this.score += points;
      this.lastResult = 'correct';
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 5); // Lose 5 points but not below 0
      this.lastResult = 'wrong';
      this.phase = 'game_over';
      this.gameOver = true;
    }
    
    return { correct, nextCard };
  }
}

class GameUI {
  constructor() {
    this.game = new GameModel();
    this.isGameActive = false;
    
    // Get all DOM elements
    this.elements = {
      round: document.getElementById('round'),
      score: document.getElementById('score'),
      streak: document.getElementById('streak'),
      cardsLeft: document.getElementById('cards-left'),
      previousCard: document.getElementById('previous-card'),
      currentCard: document.getElementById('current-card'),
      resultMessage: document.getElementById('result-message'),
      choices: document.getElementById('choices'),
      startBtn: document.getElementById('start-btn'),
      gameOver: document.getElementById('game-over'),
      finalScore: document.getElementById('final-score'),
      finalRounds: document.getElementById('final-rounds'),
      finalStreak: document.getElementById('final-streak'),
      restartBtn: document.getElementById('restart-btn'),
      btnUp: document.getElementById('btn-up'),
      btnDown: document.getElementById('btn-down'),
      btnEqual: document.getElementById('btn-equal'),
    };

    this.setupEventListeners();
    this.setupKeyboardControls();
  }

  setupEventListeners() {
    this.elements.startBtn.addEventListener('click', () => this.startGame());
    this.elements.restartBtn.addEventListener('click', () => this.restartGame());
    this.elements.btnUp.addEventListener('click', () => this.makeGuess('up'));
    this.elements.btnDown.addEventListener('click', () => this.makeGuess('down'));
    this.elements.btnEqual.addEventListener('click', () => this.makeGuess('equal'));
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      
      // U key = Game Up (Start)
      if (key === 'u') {
        if (!this.isGameActive) {
          e.preventDefault();
          this.startGame();
          this.showKeyboardHint('🎮 Game Up! Starting...');
        }
      }
      
      // D key = Game Down (Stop/Reset)
      if (key === 'd') {
        if (this.isGameActive) {
          e.preventDefault();
          this.stopGame();
          this.showKeyboardHint('🛑 Game Down! Stopping...');
        }
      }
    });
  }

  showKeyboardHint(message) {
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.textContent = message;
    document.body.appendChild(hint);
    
    setTimeout(() => {
      hint.classList.add('fade-out');
      setTimeout(() => hint.remove(), 300);
    }, 1500);
  }

  startGame() {
    this.game.startNewGame();
    this.isGameActive = true;
    this.elements.startBtn.style.display = 'none';
    this.enableChoices();
    this.updateUI();
    this.renderCard(this.game.currentCard, this.elements.currentCard);
  }

  stopGame() {
    this.isGameActive = false;
    this.game.gameOver = true;
    this.game.phase = 'game_over';
    this.disableChoices();
    this.elements.resultMessage.textContent = '🛑 Game stopped by player';
    this.elements.resultMessage.className = 'result-message stopped';
    
    setTimeout(() => {
      this.showGameOver();
    }, 1000);
  }

  restartGame() {
    this.elements.gameOver.classList.add('hidden');
    this.elements.resultMessage.textContent = '';
    this.startGame();
  }

  makeGuess(guess) {
    this.disableChoices();
    
    const result = this.game.makeGuess(guess);
    
    // Show result message
    this.elements.resultMessage.textContent = result.correct ? '✓ Correct!' : '✗ Wrong!';
    this.elements.resultMessage.className = `result-message ${result.correct ? 'correct' : 'wrong'}`;
    
    // Update previous card
    if (this.game.previousCard) {
      this.renderCard(this.game.previousCard, this.elements.previousCard);
    }
    
    // Update current card with animation
    if (this.game.currentCard) {
      setTimeout(() => {
        this.renderCard(this.game.currentCard, this.elements.currentCard);
      }, 300);
    }
    
    // Update stats
    this.updateUI();
    
    // Handle game over or continue
    setTimeout(() => {
      if (this.game.gameOver) {
        this.showGameOver();
      } else {
        this.elements.resultMessage.textContent = '';
        this.enableChoices();
      }
    }, 1500);
  }

  updateUI() {
    this.elements.round.textContent = this.game.round.toString();
    this.elements.score.textContent = this.game.score.toString();
    this.elements.streak.textContent = this.game.streak.toString();
    this.elements.cardsLeft.textContent = this.game.deck.length.toString();
  }

  renderCard(card, element) {
    element.className = `card-slot card ${card.getColor()} flip-in`;
    element.innerHTML = `
      <div class="card-value">${card.getDisplayValue()}</div>
      <div class="card-suit">${card.suit}</div>
    `;
  }

  enableChoices() {
    this.elements.btnUp.disabled = false;
    this.elements.btnDown.disabled = false;
    this.elements.btnEqual.disabled = false;
  }

  disableChoices() {
    this.elements.btnUp.disabled = true;
    this.elements.btnDown.disabled = true;
    this.elements.btnEqual.disabled = true;
  }

  showGameOver() {
    this.isGameActive = false;
    this.elements.finalScore.textContent = this.game.score.toString();
    this.elements.finalRounds.textContent = (this.game.round - 1).toString();
    this.elements.finalStreak.textContent = this.game.maxStreak.toString();
    this.elements.gameOver.classList.remove('hidden');
  }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GameUI();
  });
} else {
  new GameUI();
}

