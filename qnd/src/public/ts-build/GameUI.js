/**
 * GameUI - User interface and DOM manipulation
 */
import { GameModel } from './GameModel.js';
export class GameUI {
    constructor() {
        this.isGameActive = false;
        this.lastTapTime = 0;
        this.game = new GameModel();
        this.elements = this.getElements();
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.setupFullscreenToggle();
        this.updateUI();
    }
    getElements() {
        const getElementById = (id) => {
            const element = document.getElementById(id);
            if (!element)
                throw new Error(`Element with id "${id}" not found`);
            return element;
        };
        const querySelector = (selector) => {
            const element = document.querySelector(selector);
            if (!element)
                throw new Error(`Element "${selector}" not found`);
            return element;
        };
        return {
            round: getElementById('round'),
            score: getElementById('score'),
            streak: getElementById('streak'),
            currentCard: getElementById('current-card'),
            previousCard: getElementById('previous-card'),
            choices: getElementById('choices'),
            startBtn: getElementById('start-btn'),
            restartBtn: getElementById('restart-btn'),
            gameOver: getElementById('game-over'),
            resultMessage: getElementById('result-message'),
            finalScore: querySelector('.final-score'),
            finalRound: querySelector('.final-round'),
            finalStreak: querySelector('.final-streak'),
            header: querySelector('.game-header')
        };
    }
    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        const btnUp = document.getElementById('btn-up');
        const btnDown = document.getElementById('btn-down');
        const btnEqual = document.getElementById('btn-equal');
        btnUp?.addEventListener('click', () => this.makeGuess('up'));
        btnDown?.addEventListener('click', () => this.makeGuess('down'));
        btnEqual?.addEventListener('click', () => this.makeGuess('equal'));
    }
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            if (key === 'U') {
                e.preventDefault();
                if (!this.isGameActive && this.game.phase !== 'playing') {
                    this.startGame();
                }
            }
            if (key === 'D') {
                e.preventDefault();
                if (this.isGameActive && this.game.phase === 'playing') {
                    this.stopGame();
                }
            }
        });
    }
    setupFullscreenToggle() {
        const handleTap = (e) => {
            const rect = this.elements.header.getBoundingClientRect();
            let clickX;
            if (e instanceof TouchEvent) {
                const touch = e.changedTouches[0];
                clickX = touch.clientX - rect.left;
            }
            else {
                clickX = e.clientX - rect.left;
            }
            if (clickX < 60) {
                e.preventDefault();
                this.reloadGame();
                return;
            }
            const currentTime = Date.now();
            const tapGap = currentTime - this.lastTapTime;
            if (tapGap < 300 && tapGap > 0) {
                e.preventDefault();
                this.toggleFullscreen();
            }
            this.lastTapTime = currentTime;
        };
        this.elements.header.addEventListener('click', handleTap);
        this.elements.header.addEventListener('touchend', handleTap);
        this.elements.header.addEventListener('dblclick', (e) => {
            const rect = this.elements.header.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < 60)
                return;
            e.preventDefault();
            this.toggleFullscreen();
        });
    }
    reloadGame() {
        if (this.isGameActive) {
            if (confirm('Reload game? Your current progress will be lost.')) {
                window.location.reload();
            }
        }
        else {
            window.location.reload();
        }
    }
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Fullscreen error: ${err.message}`);
                this.showIOSFullscreenInstructions();
            });
        }
        else {
            document.exitFullscreen();
        }
    }
    showIOSFullscreenInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
            alert('To use fullscreen on iOS:\n\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Open the app from your home screen');
        }
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
        this.elements.resultMessage.textContent = result.correct ? '✓ Correct!' : '✗ Wrong!';
        this.elements.resultMessage.className = `result-message ${result.correct ? 'correct' : 'wrong'}`;
        if (this.game.previousCard) {
            this.renderCard(this.game.previousCard, this.elements.previousCard);
        }
        if (this.game.currentCard) {
            setTimeout(() => {
                this.renderCard(this.game.currentCard, this.elements.currentCard);
                this.updateUI();
                if (!this.game.gameOver) {
                    this.enableChoices();
                }
                else {
                    this.showGameOver();
                }
            }, 500);
        }
    }
    updateUI() {
        const state = this.game.getState();
        this.elements.round.textContent = state.round.toString();
        this.elements.score.textContent = state.score.toString();
        this.elements.streak.textContent = state.streak.toString();
    }
    renderCard(card, container) {
        if (!card) {
            container.innerHTML = '<div class="card-back">🎴</div>';
            return;
        }
        container.innerHTML = `
      <div class="card ${card.getColor()}">
        <div class="card-value">${card.getDisplayValue()}</div>
        <div class="card-suit">${card.suit}</div>
      </div>
    `;
    }
    enableChoices() {
        this.elements.choices.classList.remove('disabled');
    }
    disableChoices() {
        this.elements.choices.classList.add('disabled');
    }
    showGameOver() {
        const state = this.game.getState();
        this.elements.finalScore.textContent = `Score: ${state.score}`;
        this.elements.finalRound.textContent = `Rounds: ${state.round}`;
        this.elements.finalStreak.textContent = `Max Streak: ${state.maxStreak}`;
        this.elements.gameOver.classList.remove('hidden');
        this.isGameActive = false;
    }
}
