/**
 * Header — Shared compact gradient header for all views
 * DRY: ONE source of truth for lobby, game, and multiplayer headers
 */

export interface HeaderButton {
  icon: string;
  label?: string;
  onClick: () => void;
}

export interface HeaderOptions {
  title?: string;
  leftButton?: HeaderButton;
  rightButtons?: HeaderButton[];
  centerText?: string;
}

export function renderHeader(options: HeaderOptions = {}): HTMLElement {
  const title = options.title ?? '🎴 UpDown';
  const el = document.createElement('div');
  el.className = 'app-header';

  let leftHtml = '';
  if (options.leftButton) {
    leftHtml = `<button class="app-hdr-btn" id="hdr-left-btn">${options.leftButton.icon}</button>`;
  } else {
    leftHtml = '<span class="app-hdr-spacer"></span>';
  }

  let rightHtml = '';
  if (options.rightButtons && options.rightButtons.length > 0) {
    rightHtml = options.rightButtons
      .map((b, i) => `<button class="app-hdr-btn" id="hdr-right-btn-${i}">${b.icon}</button>`)
      .join('');
  } else {
    rightHtml = '<span class="app-hdr-spacer"></span>';
  }

  const centerHtml = options.centerText
    ? `<span class="app-hdr-title">${title}</span><span class="app-hdr-center">${options.centerText}</span>`
    : `<span class="app-hdr-title">${title}</span>`;

  el.innerHTML = `${leftHtml}${centerHtml}${rightHtml}`;

  // Wire click handlers after inserting into DOM
  requestAnimationFrame(() => {
    if (options.leftButton) {
      document.getElementById('hdr-left-btn')?.addEventListener('click', options.leftButton.onClick);
    }
    if (options.rightButtons) {
      options.rightButtons.forEach((b, i) => {
        document.getElementById(`hdr-right-btn-${i}`)?.addEventListener('click', b.onClick);
      });
    }
  });

  return el;
}
