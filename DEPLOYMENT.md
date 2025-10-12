# GitHub Pages Deployment Setup 🚀

This repository is configured to automatically deploy the UpDown game to GitHub Pages using GitHub Actions CI/CD.

---

## 📋 What Was Set Up

Following the **web4x/codingWeb4** default CI/CD pattern, this project now has:

### 1. GitHub Actions Workflow
- **File**: `.github/workflows/deploy-pages.yml`
- **Trigger**: Automatic on push to `main` or `dev/qnd2` branches
- **Manual**: Can be triggered via GitHub Actions tab

### 2. Build Process
- Installs Node.js 20
- Installs dependencies from `qnd/package.json`
- Builds TypeScript using esbuild: `npm run build`
- Outputs bundled JavaScript to `qnd/src/public/dist/main.js`

### 3. Deployment
- Deploys the `qnd/src/public/` directory to GitHub Pages
- Includes all static assets (HTML, CSS, images, manifest)
- Includes the built TypeScript bundle

---

## 🌐 Access Your Deployed Game

Once the GitHub Actions workflow completes, your game will be available at:

```
https://<organization>.github.io/UpDown/
```

For example, if your organization is `Cerulean-Circle-GmbH`:
```
https://cerulean-circle-gmbh.github.io/UpDown/
```

---

## 🎮 What Gets Deployed

The deployed site includes:

### Landing Page
- **URL**: `/` or `https://<org>.github.io/UpDown/`
- **File**: `index.html`
- **Purpose**: Version selector (JavaScript vs TypeScript)

### JavaScript Version
- **URL**: `/js` or `https://<org>.github.io/UpDown/js`
- **Files**: `index-js.html`, `js/game.js`
- **Tech**: Vanilla JavaScript (no compilation)

### TypeScript Version
- **URL**: `/ts` or `https://<org>.github.io/UpDown/ts`
- **Files**: `index-ts.html`, `dist/main.js`
- **Tech**: Built from TypeScript using esbuild

### PWA Assets
- `manifest.json` - Progressive Web App config
- `sw.js` - Service Worker for offline support
- `icon-192.png`, `icon-512.png` - App icons
- `styles.css` - Shared styles

---

## ⚙️ GitHub Repository Settings Required

To enable GitHub Pages deployment, ensure these settings in your GitHub repository:

1. **Go to**: Settings → Pages
2. **Source**: GitHub Actions (not "Deploy from branch")
3. **Permissions**: The workflow has these permissions set:
   - `contents: read`
   - `pages: write`
   - `id-token: write`

---

## 🔄 How It Works

### On Every Push to `main` or `dev/qnd2`:

1. ✅ GitHub Actions triggers automatically
2. 📦 Checks out the code
3. 🔧 Sets up Node.js 20
4. 📥 Installs npm dependencies (including esbuild)
5. 🏗️ Builds TypeScript with esbuild
6. 📤 Uploads `qnd/src/public/` directory
7. 🚀 Deploys to GitHub Pages
8. ✨ Your game is live!

### Build Command:
```bash
cd qnd
npm install
npm run build
```

This runs esbuild to bundle all TypeScript modules into a single `main.js` file.

---

## 📁 Project Structure

```
UpDown/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml          # CI/CD workflow
├── qnd/                               # Quick & Dirty prototype
│   ├── package.json                   # Build dependencies (esbuild, lit)
│   └── src/
│       └── public/                    # ← THIS GETS DEPLOYED
│           ├── index.html             # Landing page
│           ├── index-js.html          # JS version
│           ├── index-ts.html          # TS version
│           ├── js/
│           │   └── game.js            # Vanilla JS game
│           ├── ts/                    # TypeScript source
│           │   ├── main.ts
│           │   ├── GameModel.ts
│           │   ├── GameUI.ts
│           │   ├── Card.ts
│           │   └── components/
│           │       ├── game-board.ts
│           │       ├── game-card.ts
│           │       ├── game-controls.ts
│           │       ├── game-stats.ts
│           │       ├── keyboard-shortcuts.ts
│           │       └── player-notification.ts
│           ├── dist/                  # Built JS (generated)
│           │   └── main.js            # Bundled TypeScript
│           ├── styles.css
│           ├── manifest.json
│           ├── sw.js
│           └── icons/
└── DEPLOYMENT.md                      # This file
```

---

## 🧪 Local Testing

To test the build process locally before pushing:

```bash
cd qnd
npm install
npm run build
npm start
```

Then visit: `https://localhost:3443/`

---

## 🔧 Workflow Configuration

The workflow is based on the **web4x** standard pattern with these customizations:

- **Branch triggers**: `main` and `dev/qnd2`
- **Node.js version**: 20 (with npm cache)
- **Working directory**: `qnd/`
- **Build command**: `npm run build` (esbuild)
- **Deploy path**: `./qnd/src/public`

---

## 📊 Monitoring Deployments

### Check Deployment Status:
1. Go to your repository on GitHub
2. Click the **Actions** tab
3. See the "Deploy to GitHub Pages" workflow runs

### View Deployment:
1. Go to Settings → Pages
2. See the deployment URL and status

---

## 🛠️ Troubleshooting

### Build Fails
- Check the Actions tab for error logs
- Ensure `qnd/package.json` has all required dependencies
- Verify esbuild command in `package.json` is correct

### Site Not Loading
- Check GitHub Pages is enabled (Settings → Pages)
- Wait 1-2 minutes after deployment completes
- Clear browser cache
- Check browser console for errors

### Routes Not Working (404 on /js or /ts)
- GitHub Pages serves static files
- Make sure server-side routing is replaced with client-side routing
- Check that `index-js.html` and `index-ts.html` exist

---

## 🎯 Differences from Local Development

| Feature | Local (with server) | GitHub Pages (static) |
|---------|--------------------|-----------------------|
| **Protocol** | HTTPS (self-signed) | HTTPS (GitHub cert) |
| **Port** | :3443 | :443 (standard) |
| **Server** | Node.js/tsx | Static file server |
| **Routing** | Server-side | Client-side only |
| **WebSockets** | ✅ Supported | ❌ Not supported |
| **Backend API** | ✅ Available | ❌ Not available |

---

## 🚀 Next Steps

### To Deploy Right Now:

```bash
git add .github/
git commit -m "Add GitHub Pages deployment workflow"
git push origin dev/qnd2
```

Then:
1. Go to GitHub Actions tab
2. Watch the deployment
3. Visit your GitHub Pages URL!

### To Add More Features:
- Update code in `qnd/src/public/ts/`
- Push to `dev/qnd2` or `main`
- Automatic rebuild and redeploy!

---

## 📚 References

- **Inspiration**: [web4x/codingWeb4](https://github.com/web4x/codingWeb4)
- **Example Site**: https://web4x.github.io/codingWeb4/
- **GitHub Actions**: [Deploy to GitHub Pages](https://github.com/actions/deploy-pages)
- **esbuild**: [esbuild.github.io](https://esbuild.github.io/)

---

**Status**: ✅ Ready to deploy!  
**Pattern**: web4x default CI/CD  
**Branch**: `dev/qnd2`  
**Date**: 2025-10-12
