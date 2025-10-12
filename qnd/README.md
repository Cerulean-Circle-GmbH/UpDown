# UpDown QND Prototype 🎴

**Quick & Dirty** playable card game prototype with dual JavaScript/TypeScript implementations.

---

## 🚀 Quick Start

```bash
npm start
```

Opens your browser at **https://localhost:3443**

⚠️ Accept the self-signed certificate warning on first visit.

---

## 🎮 Three Ways to Play

| Route | Version | Tech Stack | Best For |
|-------|---------|------------|----------|
| **`/`** | **Selector** | HTML + CSS | Choosing your version |
| **`/js`** | **JavaScript** | Vanilla JS | Maximum compatibility |
| **`/ts`** | **TypeScript** | TS ESM modules | Modern development |

### `/` - Version Selector
Beautiful landing page with interactive cards to choose between versions.

### `/js` - JavaScript Version
- Single-file implementation
- Plain JavaScript (no compilation)
- Works on all browsers
- Badge: **STABLE**

### `/ts` - TypeScript Version
- Modular ESM architecture
- Full type safety
- Modern TypeScript 5.x
- Badge: **MODERN**

---

## 🛑 Stop Server

```bash
npm run stop
```

---

## 📁 Project Structure

```
qnd/
│
├── 📄 Configuration
│   ├── package.json            # Dependencies & scripts
│   ├── tsconfig.json           # TypeScript config
│   └── .gitignore
│
├── 📖 Documentation (spec/)
│   ├── README.md               # This file (moved to root)
│   ├── server.spec.md          # Server architecture
│   ├── ux.spec.md              # UX requirements
│   └── ROUTES.md               # Routing documentation
│
└── 💻 Source Code (src/)
    │
    ├── ts/server/              # Backend (TypeScript HTTPS Server)
    │   ├── server.ts           # Main server
    │   └── .certs/             # SSL certificates
    │
    ├── public/                 # Frontend (Static Assets)
    │   ├── index.html          # Version selector
    │   ├── index-js.html       # JS version HTML
    │   ├── index-ts.html       # TS version HTML
    │   ├── styles.css          # Shared styles
    │   ├── manifest.json       # PWA manifest
    │   ├── sw.js               # Service worker
    │   │
    │   ├── js/                 # JavaScript Version
    │   │   └── game.js         # All-in-one file (594 lines)
    │   │
    │   └── ts/                 # TypeScript Version (Modular)
    │       ├── Card.ts         # Card class + types
    │       ├── GameModel.ts    # Game logic
    │       ├── GameUI.ts       # UI handling
    │       └── main.ts         # Entry point
    │
    └── sh/                     # Shell Scripts
        ├── updown.sh           # Start script
        ├── stop.sh             # Stop script
        └── generate-icons.sh   # Icon generation
```

---

## 🎯 Game Features

- ✅ **Card Game**: Higher/Lower guessing with 52-card deck
- ✅ **Scoring**: Points + streak system
- ✅ **PWA**: Installable as app, works offline
- ✅ **Responsive**: iPhone 4 to iPhone 15+, desktop, tablet
- ✅ **HTTPS**: Self-signed SSL with automatic redirect
- ✅ **Fullscreen**: Double-tap header for borderless mode
- ✅ **Keyboard**: `U` = Start, `D` = Stop
- ✅ **Touch**: Optimized for mobile with install prompt

---

## 🔧 Development

### JavaScript Version

```bash
# Edit the single file
nano src/public/js/game.js

# No compilation needed, just reload browser
```

### TypeScript Version

```bash
# Edit modules
nano src/public/ts/Card.ts
nano src/public/ts/GameModel.ts
nano src/public/ts/GameUI.ts
nano src/public/ts/main.ts

# tsx runs TypeScript directly, no build step
```

### Watch Mode (Auto-reload)

```bash
npm run dev
```

---

## 📊 Version Comparison

| Feature | JavaScript (`/js`) | TypeScript (`/ts`) |
|---------|-------------------|--------------------|
| **Type Safety** | ❌ None | ✅ Full |
| **Modules** | ❌ Single file | ✅ ES modules |
| **Maintainability** | ⚠️ Good | ✅ Excellent |
| **Browser Support** | ✅ All browsers | ✅ Modern browsers |
| **Learning Curve** | ✅ Easy | ⚠️ Moderate |
| **IDE Support** | ⚠️ Basic | ✅ Advanced |
| **Compilation** | ❌ None | ✅ Runtime (tsx) |
| **File Size** | 594 lines (1 file) | ~400 lines (4 modules) |

---

## 🌐 URLs & Routes

```bash
# Version selector
https://localhost:3443/

# JavaScript version
https://localhost:3443/js

# TypeScript version
https://localhost:3443/ts

# Auto-redirect shortcuts
https://localhost:3443/?v=js
https://localhost:3443/?v=ts
```

---

## 🔐 Security

- **HTTPS Only**: TLS 1.2+ with RSA 2048-bit keys
- **Self-Signed Cert**: Auto-generated on first run
- **Location**: `src/ts/server/.certs/`
- **Ports**: 3443 (HTTPS), 3000 (HTTP redirect)
- **Production**: Ready for Let's Encrypt certificate

---

## 📱 PWA Features

- ✅ **Installable**: Browser install prompt
- ✅ **Offline**: Service Worker caching
- ✅ **Home Screen**: "Add to Home Screen" on mobile
- ✅ **Standalone**: Fullscreen app mode
- ✅ **Icons**: 192x192 and 512x512 PNG
- ✅ **Manifest**: Complete PWA configuration

---

## 🎨 UI/UX Highlights

- **Responsive Design**: Mobile-first approach
- **Portrait & Landscape**: Auto-switching layouts
- **Animations**: Smooth card transitions
- **Gradient Theme**: Purple/blue gradient (#667eea → #764ba2)
- **Touch Optimized**: Large tap targets
- **Accessibility**: Keyboard navigation support
- **Dark Mode Ready**: CSS variables for theming

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v24+
- **Language**: TypeScript ESM
- **Server**: Native HTTPS module
- **Execution**: tsx (no build step)
- **SSL**: OpenSSL (self-signed)

### Frontend
- **Languages**: JavaScript + TypeScript
- **Styling**: Vanilla CSS (no frameworks)
- **PWA**: Service Worker + Manifest
- **Icons**: SVG + PNG
- **Modules**: ES6 imports/exports

### DevOps
- **Scripts**: Bash (sh/)
- **Package Manager**: npm
- **Version Control**: Git
- **Development**: Watch mode with tsx

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `spec/server.spec.md` | Server architecture, HTTPS setup, PWA config |
| `spec/ux.spec.md` | UX requirements tracking with commit SHAs |
| `spec/ROUTES.md` | Dual routing system documentation |
| `STRUCTURE.md` | Visual project organization |

---

## 🚀 Deployment

This prototype is development-ready with:
- Self-signed certificates (replace with Let's Encrypt for production)
- Static file serving (can use nginx/caddy in production)
- PWA support (works with any HTTPS server)

---

## 🎓 Learning Path

### Beginner
Start with **`/js`** version:
- Single file to understand
- Plain JavaScript
- No compilation complexity

### Intermediate
Move to **`/ts`** version:
- Learn TypeScript syntax
- Understand ES modules
- See separation of concerns

### Advanced
Explore the server:
- TypeScript backend (`src/ts/server/`)
- HTTPS implementation
- Routing logic

---

## 🔗 Quick Links

- **Play Now**: https://localhost:3443/
- **GitHub**: See parent directory for full project
- **Branch**: `dev/qnd2`

---

## ⚡ Quick Commands

```bash
# Start everything
npm start

# Stop everything
npm run stop

# Development mode (watch)
npm run dev

# Direct script access
./src/sh/updown.sh
./src/sh/stop.sh
```

---

**Made with ❤️ for rapid prototyping**  
This is the QND (Quick & Dirty) prototype. For the full project with sprints, documentation, and DevOps, see the parent directory.
