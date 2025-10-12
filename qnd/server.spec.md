# UpDown Game - Server Specification

## Meta Requirement

> **Quote 0**: "ok. so its your server. make it https and a pwa. create a server.spec.md next to ux.spec.md in similar format."

**Status**: ✅ REALIZED  
**Implementation**: Node.js HTTPS server with PWA support (service worker, manifest, offline capability)  
**Files**: `server.js`, `public/manifest.json`, `public/sw.js`, `updown.sh`  
**Commit**: `846ab48`

---

## Chapter 1: Server Requirements Tracking

| # | User Quote | Status | Implementation | Files | Code Reference | Commit SHA |
|---|------------|--------|----------------|-------|----------------|------------|
| 1 | "make it https" | ✅ REALIZED | Node.js HTTPS server with self-signed SSL certificates | `server.js`<br>`updown.sh`<br>`.gitignore` | HTTPS server: `server.js:102-121`<br>Certificate generation: `server.js:68-88`<br>Launch script: `updown.sh:17-20` | `846ab48` |
| 2 | "make it a pwa" | ✅ REALIZED | PWA manifest, service worker, offline support, app icons | `public/manifest.json`<br>`public/sw.js`<br>`public/index.html`<br>`public/game.js`<br>`generate-icons.sh` | Manifest: `manifest.json:1-30`<br>Service Worker: `sw.js:1-120`<br>SW Registration: `game.js:479-498`<br>Manifest link: `index.html:14` | `846ab48` |

---

## Chapter 2: Technical Architecture

### Server Stack

#### Core Components
- **Runtime**: Node.js (built-in modules only)
- **Language**: TypeScript with ES Modules (ESM)
- **Protocol**: HTTPS with TLS 1.2+
- **Ports**: 3443 (HTTPS), 3000 (HTTP redirect)
- **Certificate**: Self-signed (OpenSSL)
- **Execution**: tsx (TypeScript executor)

#### Server Features
1. **HTTPS Server** (`server.ts`)
   - Modern TypeScript with ES Modules (ESM)
   - Async/await throughout
   - Full type safety
   - Self-signed SSL certificate generation
   - Automatic HTTP → HTTPS redirect
   - Static file serving from `public/` directory
   - MIME type detection
   - Cache control headers
   - Fallback to HTTP if SSL fails

2. **PWA Support**
   - **Manifest** (`manifest.json`)
     - App name, icons, theme colors
     - Standalone display mode
     - Any orientation support
     - App categorization
   
   - **Service Worker** (`sw.js`)
     - Asset caching strategy
     - Offline functionality
     - Cache-first with network fallback
     - Automatic cache updates
     - Version management

3. **Icon Generation** (`generate-icons.sh`)
   - SVG source icon
   - 192x192 and 512x512 PNG outputs
   - Gradient background (#667eea → #764ba2)
   - Card emoji 🎴

---

## Chapter 3: Server Implementation Details

### HTTPS Configuration

```typescript
// Self-signed certificate with OpenSSL
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
  -keyout .certs/key.pem -out .certs/cert.pem \
  -subj "/CN=localhost"

// TypeScript ESM HTTPS server
const [key, cert] = await Promise.all([
  fs.readFile(KEY_FILE, 'utf-8'),
  fs.readFile(CERT_FILE, 'utf-8')
]);

const options: https.ServerOptions = { key, cert };
https.createServer(options, handleRequest).listen(3443);
```

### PWA Manifest Structure

```json
{
  "name": "UpDown Card Game",
  "short_name": "UpDown",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" }
  ]
}
```

### Service Worker Lifecycle

1. **Install**: Cache static assets (HTML, CSS, JS, manifest)
2. **Activate**: Clean up old caches, claim clients
3. **Fetch**: Serve from cache, fallback to network
4. **Update**: Detect new versions, notify user

### Caching Strategy

- **Cache-First**: For static assets (HTML, CSS, JS)
- **Network-First**: For dynamic content (future API calls)
- **Offline Fallback**: Custom offline page
- **Cache Name**: `updown-v1` (versioned for updates)

---

## Chapter 4: Security & Performance

### Security Features

1. **TLS Encryption**
   - RSA 2048-bit keys
   - SHA-256 signing
   - HTTPS-only in production

2. **Content Security**
   - Proper MIME type headers
   - No inline scripts/styles in future versions
   - CORS headers for API (when added)

3. **Certificate Management**
   - Self-signed for development
   - Let's Encrypt ready for production
   - Auto-renewal support (future)

### Performance Optimizations

1. **Caching**
   - Service worker caching
   - No-cache headers for development
   - Cache-Control for production

2. **Asset Delivery**
   - Gzip compression (future)
   - CDN-ready structure
   - Lazy loading support

3. **Offline Support**
   - Full game playable offline
   - Service worker cache
   - Background sync (future)

---

## Chapter 5: Deployment & Operations

### Development Setup

```bash
# Start HTTPS server
npm start

# Generates certificates, starts server, opens browser
# URL: https://localhost:3443
# HTTP redirect: http://localhost:3000 → https://localhost:3443
```

### Stop Server

```bash
npm run stop

# Kills processes on ports 3000 and 3443
```

### File Structure

```
UpDown.fast/
├── server.ts              # ✅ Modern TypeScript ESM HTTPS server
├── server.spec.md         # 📄 Server documentation
├── ux.spec.md             # 📄 UX requirements tracking
├── updown.sh              # 🚀 Launch script (npm start)
├── stop.sh                # 🛑 Stop script (npm run stop)
├── generate-icons.sh      # 🎨 Icon generator
├── package.json           # 📦 Dependencies & scripts
├── tsconfig.json          # ⚙️ TypeScript configuration
├── .gitignore             # 🚫 Ignore certs, node_modules
│
├── .certs/                # 🔐 SSL certificates (auto-generated, gitignored)
│   ├── cert.pem          # Self-signed certificate
│   └── key.pem           # Private key
│
├── public/                # 🎮 Game frontend (served via HTTPS)
│   ├── index.html         # Main HTML
│   ├── game.js            # Game logic (plain JS)
│   ├── styles.css         # Responsive styles
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   ├── icon.svg           # Source icon
│   ├── icon-192.png       # App icon 192x192
│   └── icon-512.png       # App icon 512x512
│
├── src/shared/            # ♠️ Shared game models (TypeScript)
│   ├── Card.ts            # Card class & deck logic
│   ├── GameModel.ts       # Game state & logic
│   ├── Player.ts          # Player class
│   ├── Lobby.ts           # Multiplayer lobby
│   └── Scenario.ts        # Game scenarios
│
├── docs/                  # 📚 Documentation
├── devops/                # 🐳 DevOps scripts
└── sprints/               # 📋 Sprint planning
```

---

## Chapter 6: Browser Compatibility

### Service Worker Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 40+ | ✅ Full Support |
| Safari | 11.1+ | ✅ Full Support |
| Firefox | 44+ | ✅ Full Support |
| Edge | 17+ | ✅ Full Support |
| iOS Safari | 11.3+ | ✅ Full Support |
| Android Chrome | 40+ | ✅ Full Support |

### PWA Install Prompt

| Platform | Support | How to Install |
|----------|---------|----------------|
| Chrome Desktop | ✅ Native prompt | Click install icon (⊕) in address bar |
| Chrome Android | ✅ Native prompt | Tap "Add to Home screen" in menu |
| Safari iOS | ✅ "Add to Home Screen" | Share button → "Add to Home Screen" |
| Safari macOS | ✅ "Add to Dock" | Click install icon in address bar or File → "Add to Dock" |
| Edge Desktop | ✅ Native prompt | Click install icon (⊕) in address bar |
| Firefox Android | ✅ Manual install | Menu → "Install" |

### Browser Install Icon

The PWA install prompt appears automatically in supported browsers:

**Desktop (Chrome/Edge/Safari):**
```
https://localhost:3443  [🔒] [⊕ Install]
                               ↑
                    Click this icon to install
```

**Criteria for Install Prompt:**
- ✅ Served over HTTPS
- ✅ Has valid `manifest.json`
- ✅ Has registered Service Worker
- ✅ Service Worker has `fetch` event handler
- ✅ Manifest includes `name`, `short_name`, `icons`, `start_url`, `display`

**Install Dialog:**
```
┌─────────────────────────────────────┐
│ Install UpDown?                     │
│                                     │
│ This site can be installed as an   │
│ app. It will open in its own       │
│ window and integrate with your     │
│ system.                             │
│                                     │
│     [Cancel]        [Install]      │
└─────────────────────────────────────┘
```

### Custom Install Prompt

In addition to the browser's native install icon, UpDown includes a **custom install hint** that appears automatically:

**Visual Design:**
```
┌────────────────────────────────────────────┐
│  📱  Install UpDown as an app  [Install] ✕ │
└────────────────────────────────────────────┘
         ↑ Slides up from bottom
```

**Features:**
- 🎯 Appears 3-5 seconds after page load (browser-dependent)
- 📱 Beautiful gradient banner matching game theme
- 🔘 One-click install button
- ✕ Dismissible with close button
- ⏱️ Auto-hides after 10 seconds
- 📊 Only shows if PWA is installable
- 🚫 Doesn't show if already installed

**Implementation:**
- Listens for `beforeinstallprompt` event
- Defers browser's default prompt
- Shows custom UI with better UX
- Triggers native install on button click
- Handles `appinstalled` event

**Code Location:**
- JavaScript: `public/game.js:479-562`
- CSS: `public/styles.css:993-1110`

---

## Chapter 7: Testing & Verification

### Manual Testing Checklist

- [ ] HTTPS server starts without errors
- [ ] Self-signed certificate generated
- [ ] HTTP redirects to HTTPS
- [ ] Browser shows lock icon (after accepting cert)
- [ ] Service worker registers successfully
- [ ] Assets cached properly
- [ ] Works offline after first visit
- [ ] PWA install prompt appears
- [ ] Installed app works standalone
- [ ] Icons display correctly
- [ ] Manifest loads without errors

### Console Verification

```javascript
// Check service worker
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('SW:', regs));

// Check cache
caches.keys()
  .then(names => console.log('Caches:', names));

// Check if installed
window.matchMedia('(display-mode: standalone)').matches
  // true if installed as PWA
```

### DevTools Audit

1. **Lighthouse PWA Score**
   - Target: 100/100
   - Fast, reliable, installable

2. **Application Tab**
   - ✅ Manifest parsed
   - ✅ Service worker active
   - ✅ Cache storage populated
   - ✅ Icons loaded

---

## Chapter 8: Future Enhancements

### Planned Features

1. **Production HTTPS**
   - Let's Encrypt integration
   - Auto certificate renewal
   - ACME protocol support

2. **Advanced PWA**
   - Push notifications
   - Background sync
   - Share target API
   - Badge API for streak

3. **Performance**
   - Gzip/Brotli compression
   - HTTP/2 support
   - Resource hints (preload, prefetch)
   - Code splitting

4. **Security**
   - Content Security Policy
   - Subresource Integrity
   - HTTPS-only cookies (when adding backend)

5. **Monitoring**
   - Service worker analytics
   - Error tracking
   - Performance monitoring
   - User analytics (privacy-focused)

---

## Appendix: Change Log

| Date | Version | Changes | Commit |
|------|---------|---------|--------|
| 2025-10-12 | 0.2.0 | Initial HTTPS server with PWA support | `846ab48` |
| 2025-10-12 | 0.3.0 | Migrated to TypeScript ESM with modern Node.js features | `f704298` + `e0ce029` |

---

## Appendix: Known Issues & Limitations

### Development Certificate Warning

**Issue**: Browser shows "Not Secure" warning for self-signed certificate  
**Impact**: User must manually accept certificate  
**Workaround**: Click "Advanced" → "Proceed to localhost"  
**Solution**: Use proper certificate in production

### iOS PWA Rotation Flicker

**Issue**: Known iOS bug causes flickering on repeated rotations  
**Impact**: Visual glitch, no functionality loss  
**Status**: Apple iOS system bug (see ux.spec.md)  
**Workaround**: None available

### Icon Format

**Issue**: SVG icons may not work on all platforms  
**Impact**: Some devices may not show app icon  
**Workaround**: Generate proper PNG icons with ImageMagick  
**Command**: See `generate-icons.sh`

---

## Appendix: Commands Reference

```bash
# Start server
npm start

# Stop server
npm run stop

# Generate icons (requires ImageMagick)
brew install imagemagick
./generate-icons.sh

# Check certificate
openssl x509 -in .certs/cert.pem -text -noout

# Test HTTPS manually
curl -k https://localhost:3443

# Kill all servers
lsof -ti:3000,3443 | xargs kill -9

# Check service worker
chrome://serviceworker-internals/

# Clear all caches
# DevTools → Application → Clear storage → Clear site data
```

