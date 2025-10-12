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
├── server.ts              # ✅ TypeScript ESM HTTPS server
├── server.spec.md         # 📄 Server documentation
├── ux.spec.md             # 📄 UX requirements tracking
├── updown.sh              # 🚀 Launch script
├── stop.sh                # 🛑 Stop script
├── generate-icons.sh      # 🎨 Icon generator
├── package.json           # 📦 Dependencies & scripts
├── tsconfig.json          # ⚙️ TypeScript config
├── .gitignore             # 🚫 Ignored files
│
├── .certs/                # 🔐 SSL certificates (auto-generated)
│   ├── cert.pem
│   └── key.pem
│
└── public/                # 🎮 Game frontend
    ├── index.html
    ├── game.js
    ├── styles.css
    ├── manifest.json      # PWA manifest
    ├── sw.js              # Service worker
    └── icons/
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

## 📱 Mobile

- Responsive design (iPhone 4 to iPhone 15+)
- Portrait and landscape support
- PWA install prompt
- Touch-optimized controls

## 📚 Documentation

- **Server**: See `server.spec.md`
- **UX**: See `ux.spec.md`

## 🛠️ Tech Stack

- **Backend**: Node.js + TypeScript ESM
- **Frontend**: Vanilla JS + CSS
- **Server**: HTTPS with self-signed cert
- **PWA**: Service Worker + Manifest
- **Execution**: tsx (TypeScript runner)

---

**This is the "quick & dirty" prototype.**  
For the full project structure with sprints, docs, and devops, see the parent directory.

