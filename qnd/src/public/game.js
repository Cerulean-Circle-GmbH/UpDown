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
    this.lastTapTime = 0;
    
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
      header: document.querySelector('.game-header'),
    };

    this.setupEventListeners();
    this.setupKeyboardControls();
    this.setupFullscreenToggle();
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

  setupFullscreenToggle() {
    // Handle reload button (left side) and fullscreen toggle (double-click)
    const handleTap = (e) => {
      const rect = this.elements.header.getBoundingClientRect();
      
      // Get X position from either mouse or touch event
      let clickX;
      if (e.type === 'touchstart' || e.type === 'touchend') {
        const touch = e.changedTouches[0];
        clickX = touch.clientX - rect.left;
      } else {
        clickX = e.clientX - rect.left;
      }
      
      // Check if tap/click is on the left side (reload button area - first 60px)
      if (clickX < 60) {
        e.preventDefault();
        this.reloadGame();
        return;
      }
      
      // Handle double-click/tap for fullscreen (rest of header)
      const currentTime = new Date().getTime();
      const tapGap = currentTime - this.lastTapTime;
      
      // Detect double tap (within 300ms)
      if (tapGap < 300 && tapGap > 0) {
        e.preventDefault();
        this.toggleFullscreen();
      }
      
      this.lastTapTime = currentTime;
    };
    
    // Add both click and touch listeners
    this.elements.header.addEventListener('click', handleTap);
    this.elements.header.addEventListener('touchend', handleTap);
    
    // Also support native double-click on desktop
    this.elements.header.addEventListener('dblclick', (e) => {
      const rect = this.elements.header.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      
      // Don't trigger fullscreen if clicking reload area
      if (clickX < 60) return;
      
      e.preventDefault();
      this.toggleFullscreen();
    });
  }

  reloadGame() {
    // Confirm reload if game is active
    if (this.isGameActive) {
      if (confirm('Reload game? Your current progress will be lost.')) {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  }

  toggleFullscreen() {
    const elem = document.documentElement;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // iOS Safari doesn't support Fullscreen API for regular web content
    if (isIOS) {
      // Check if already in standalone mode (added to home screen)
      if (window.navigator.standalone) {
        this.showKeyboardHint('📱 Already in App Mode');
        return;
      }
      
      // Show instructions to add to home screen for true fullscreen
      this.showIOSFullscreenInstructions();
      return;
    }
    
    // Standard fullscreen for other browsers
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement &&
        !document.msFullscreenElement) {
      // Enter fullscreen
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { // Safari desktop
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
      
      this.showKeyboardHint('📱 Fullscreen Mode');
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      
      this.showKeyboardHint('🖥️ Exited Fullscreen');
    }
  }

  showIOSFullscreenInstructions() {
    // Create a more prominent instruction overlay for iOS
    const overlay = document.createElement('div');
    overlay.className = 'ios-fullscreen-overlay';
    overlay.innerHTML = `
      <div class="ios-fullscreen-content">
        <h3>📱 iOS Fullscreen Mode</h3>
        <p>For the best fullscreen experience on iPhone:</p>
        <ol>
          <li>Tap the <strong>Share</strong> button <span style="font-size: 1.5rem;">⎙</span></li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
          <li>Open the app from your home screen</li>
        </ol>
        <p><small>Or scroll down in Safari to auto-hide the browser bars</small></p>
        <button class="ios-close-btn">Got it!</button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Close button handler
    overlay.querySelector('.ios-close-btn').addEventListener('click', () => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 300);
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
      }
    });
    
    // Auto-scroll to hide Safari UI as a workaround
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);
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

// Handle orientation changes - smooth without flickering
let orientationTimeout;
window.addEventListener('resize', () => {
  clearTimeout(orientationTimeout);
  // No forced reflow - let CSS media queries handle it naturally
  orientationTimeout = setTimeout(() => {
    // Optional: trigger any needed updates
  }, 200);
});

// Show orientation hint on first load
window.addEventListener('load', () => {
  if (window.matchMedia('(orientation: portrait)').matches && window.innerWidth < 768) {
    const hint = document.createElement('div');
    hint.className = 'orientation-hint';
    hint.innerHTML = '📱 Rotate for landscape mode!';
    document.body.appendChild(hint);
    
    setTimeout(() => {
      hint.classList.add('fade-out');
      setTimeout(() => hint.remove(), 500);
    }, 3000);
  }
});

// PWA Install Prompt Handler
let deferredInstallPrompt = null;

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default mini-infobar
  e.preventDefault();
  
  // Stash the event for later use
  deferredInstallPrompt = e;
  
  console.log('✅ PWA install prompt ready');
  
  // Show custom install hint (optional - could add a button)
  showInstallHint();
});

// Handle successful install
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully!');
  deferredInstallPrompt = null;
  
  // Hide install hint if showing
  const hint = document.querySelector('.install-hint');
  if (hint) {
    hint.remove();
  }
});

// Show install hint
function showInstallHint() {
  // Check if already installed or hint already showing
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return; // Already installed
  }
  
  if (document.querySelector('.install-hint')) {
    return; // Already showing
  }
  
  const hint = document.createElement('div');
  hint.className = 'install-hint';
  hint.innerHTML = `
    <div class="install-hint-content">
      <span class="install-icon">📱</span>
      <span class="install-text">Install UpDown as an app</span>
      <button class="install-btn">Install</button>
      <button class="install-close">✕</button>
    </div>
  `;
  
  document.body.appendChild(hint);
  
  // Handle install button click
  hint.querySelector('.install-btn').addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      return;
    }
    
    // Show the install prompt
    deferredInstallPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log(`PWA install ${outcome}`);
    
    // Clear the prompt
    deferredInstallPrompt = null;
    hint.remove();
  });
  
  // Handle close button
  hint.querySelector('.install-close').addEventListener('click', () => {
    hint.remove();
  });
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (hint.parentElement) {
      hint.classList.add('fade-out');
      setTimeout(() => hint.remove(), 500);
    }
  }, 10000);
}

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New version available! Reload to update.');
          }
        });
      });
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GameUI();
  });
} else {
  new GameUI();
}

