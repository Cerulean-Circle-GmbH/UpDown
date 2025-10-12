# QND Project Structure

```
qnd/
│
├── 📄 Configuration Files
│   ├── package.json            # Dependencies & npm scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── .gitignore              # Git ignore rules
│   └── README.md               # Main documentation
│
├── 📁 spec/                    # Documentation & Specifications
│   ├── README.md               # Spec documentation (copy of main README)
│   ├── server.spec.md          # Server architecture & API docs
│   └── ux.spec.md              # UX requirements & tracking
│
└── 📁 src/                     # Source Code
    │
    ├── 📁 ts/                  # TypeScript Code
    │   └── server/             # HTTPS Server
    │       ├── server.ts       # Main server file (ESM)
    │       └── .certs/         # SSL Certificates (gitignored)
    │           ├── cert.pem    # Self-signed certificate
    │           └── key.pem     # Private key
    │
    ├── 📁 public/              # Frontend (Static Files)
    │   ├── index.html          # Main HTML page
    │   ├── game.js             # Game logic (vanilla JS)
    │   ├── styles.css          # Responsive styles
    │   ├── manifest.json       # PWA manifest
    │   ├── sw.js               # Service Worker
    │   ├── icon.svg            # Source icon (SVG)
    │   ├── icon-192.png        # App icon (192x192)
    │   └── icon-512.png        # App icon (512x512)
    │
    ├── 📁 sh/                  # Shell Scripts
    │   ├── updown.sh           # Start server (npm start)
    │   ├── stop.sh             # Stop server (npm run stop)
    │   └── generate-icons.sh   # Generate PWA icons
    │
    └── 📁 js/                  # JavaScript (reserved for future)
        └── (empty)
```

## Directory Purposes

### `spec/` - Documentation
- Technical specifications
- Architecture documentation
- UX requirements and tracking
- API documentation

### `src/ts/` - TypeScript Source
- Server implementation
- Future: shared models, utilities
- Compiled with `tsx` (no build step)

### `src/public/` - Frontend Assets
- Served directly by HTTPS server
- PWA assets (manifest, service worker)
- Game UI and logic
- Responsive styles

### `src/sh/` - Shell Scripts
- Launch scripts
- Stop scripts
- Utility scripts
- Icon generation

### `src/js/` - JavaScript Source
- Reserved for future use
- Could contain: utilities, shared code
- Currently empty

## File Paths Reference

| Component | Path |
|-----------|------|
| **Server** | `src/ts/server/server.ts` |
| **Frontend** | `src/public/` |
| **Start Script** | `src/sh/updown.sh` |
| **Stop Script** | `src/sh/stop.sh` |
| **SSL Certs** | `src/ts/server/.certs/` |
| **Server Docs** | `spec/server.spec.md` |
| **UX Docs** | `spec/ux.spec.md` |

## Quick Commands

```bash
# Start server
npm start

# Stop server  
npm run stop

# Development (watch mode)
npm run dev

# From scripts directly
./src/sh/updown.sh
./src/sh/stop.sh
```

## URLs

- **HTTPS**: https://localhost:3443
- **HTTP Redirect**: http://localhost:3000 → HTTPS

## Tech Stack

- **Runtime**: Node.js v24+
- **Language**: TypeScript (ESM)
- **Execution**: tsx (TypeScript executor)
- **Server**: Native Node.js HTTPS
- **Frontend**: Vanilla JS + CSS
- **PWA**: Service Worker + Manifest
- **Security**: Self-signed SSL (OpenSSL)

