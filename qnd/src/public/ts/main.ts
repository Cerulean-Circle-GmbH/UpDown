/**
 * Main entry point - TypeScript ESM version with Lit web components
 */

import './components/game-board.js';

// PWA Install Prompt Handler
let deferredInstallPrompt: any = null;

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  console.log('✅ PWA install prompt ready');
  showInstallHint();
});

// Handle successful install
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully!');
  deferredInstallPrompt = null;

  const hint = document.querySelector('.install-hint');
  if (hint) {
    hint.remove();
  }
});

// Show install hint
function showInstallHint(): void {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  if (document.querySelector('.install-hint')) {
    return;
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

  const installBtn = hint.querySelector('.install-btn') as HTMLButtonElement;
  const closeBtn = hint.querySelector('.install-close') as HTMLButtonElement;

  installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log(`PWA install ${outcome}`);

    deferredInstallPrompt = null;
    hint.remove();
  });

  closeBtn.addEventListener('click', () => {
    hint.remove();
  });

  setTimeout(() => {
    if (hint.parentElement) {
      hint.classList.add('fade-out');
      setTimeout(() => hint.remove(), 500);
    }
  }, 10000);
}

// Service Worker disabled for now (not essential for Lit components)
// TODO: Re-enable PWA features later if needed

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎴 TypeScript Lit web components version initialized');
  });
} else {
  console.log('🎴 TypeScript Lit web components version initialized');
}

