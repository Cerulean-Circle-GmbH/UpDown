# UpDown - Quick & Dirty Prototype 🎴

**Fast, functional, playable card game prototype.**

## 🚀 Quick Start

```bash
npm start
```

This starts the HTTPS server and opens your browser automatically at https://localhost:3443

## 🛑 Stop Server

```bash
npm run stop
```

## 📁 Structure

```
qnd/
├── spec/                   # 📄 Documentation & Specifications
│   ├── README.md           # This file
│   ├── server.spec.md      # Server documentation
│   └── ux.spec.md          # UX requirements tracking
│
├── src/                    # 💻 Source Code
│   ├── ts/                 # TypeScript
│   │   └── server/         # HTTPS Server
│   │       ├── server.ts   # Main server file
│   │       └── .certs/     # SSL certificates (auto-generated)
│   │
│   ├── public/             # 🎮 Frontend (served static)
│   │   ├── index.html
│   │   ├── game.js         # Game logic
│   │   ├── styles.css
│   │   ├── manifest.json   # PWA manifest
│   │   ├── sw.js           # Service worker
│   │   └── icons/
│   │
│   ├── sh/                 # Shell Scripts
│   │   ├── updown.sh       # Start script
│   │   ├── stop.sh         # Stop script
│   │   └── generate-icons.sh
│   │
│   └── js/                 # JavaScript (reserved for future use)
│
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── .gitignore              # Ignored files
```

## 🎮 Features

- ✅ **Card Game**: Higher/Lower guessing game with full deck
- ✅ **HTTPS Server**: Modern TypeScript ESM with self-signed SSL
- ✅ **PWA Support**: Installable, works offline
- ✅ **Responsive**: Works on desktop, tablet, and mobile
- ✅ **Keyboard Shortcuts**: U = Start, D = Stop
- ✅ **Full Screen**: Double-tap header for borderless mode

## 🔐 Security

- Self-signed SSL certificate (auto-generated on first run)
- HTTPS on port 3443, HTTP redirect on port 3000
- Accept certificate warning in browser on first visit
- Certificates stored in `src/ts/server/.certs/`

## 📱 Mobile

- Responsive design (iPhone 4 to iPhone 15+)
- Portrait and landscape support
- PWA install prompt
- Touch-optimized controls

## 📚 Documentation

- **Server**: See `spec/server.spec.md`
- **UX**: See `spec/ux.spec.md`

## 🛠️ Tech Stack

- **Backend**: Node.js + TypeScript ESM
- **Frontend**: Vanilla JS + CSS
- **Server**: HTTPS with self-signed cert
- **PWA**: Service Worker + Manifest
- **Execution**: tsx (TypeScript runner)

## 🔧 Development

**Watch mode** (auto-reload on changes):
```bash
npm run dev
```

## 📝 File Paths

- **Server**: `src/ts/server/server.ts`
- **Frontend**: `src/public/`
- **Scripts**: `src/sh/`
- **Specs**: `spec/`

---

**This is the "quick & dirty" prototype.**  
For the full project structure with sprints, docs, and devops, see the parent directory.

