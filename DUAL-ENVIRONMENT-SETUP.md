# Dual Environment Setup - Single Source for Local & GitHub Pages 🎯

## Problem Solved

Previously, the code had hardcoded paths:
- ❌ `/UpDown/dist/main.js` - Only worked on GitHub Pages
- ❌ Local server couldn't serve the same files

Now, **the same source code works in BOTH environments**!

---

## Solution: Dynamic Base Path Detection

### How It Works

Each HTML file includes this intelligent snippet:

```html
<head>
  <meta charset="UTF-8">
  <!-- Dynamic base path for GitHub Pages vs localhost -->
  <script>
    // Detect environment and set base path
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/UpDown/' : '/';
    document.write('<base href="' + basePath + '">');
  </script>
  <!-- All following links use relative paths -->
```

### Environment Detection

**On GitHub Pages:**
- Hostname: `cerulean-circle-gmbh.github.io`
- Base path: `/UpDown/`
- Full URL: `https://cerulean-circle-gmbh.github.io/UpDown/dist/main.js`

**On Local Server:**
- Hostname: `localhost`
- Base path: `/`
- Full URL: `http://localhost:3443/dist/main.js`

---

## Changes Made

### 1. HTML Files Updated

**index.html, index-js.html, index-ts.html:**
- ✅ Added dynamic `<base>` tag
- ✅ Changed all paths from absolute to relative:
  - `/UpDown/dist/main.js` → `dist/main.js`
  - `/UpDown/icon-192.png` → `icon-192.png`
  - `/UpDown/js/` → `js/`

### 2. Server Updated

**qnd/src/ts/server/server.ts:**
```typescript
// Route handling (supports both /js and /js/ patterns)
if (filepath === '/' || filepath === '/index.html') {
  filepath = '/index.html';
} else if (filepath === '/js' || filepath === '/js/') {
  filepath = '/index-js.html'; // Serve the main HTML file
} else if (filepath === '/ts' || filepath === '/ts/') {
  filepath = '/index-ts.html'; // Serve the main HTML file
}
```

Now handles:
- `/js` → serves `index-js.html`
- `/js/` → serves `index-js.html`
- `/ts` → serves `index-ts.html`
- `/ts/` → serves `index-ts.html`

---

## Benefits

### ✅ **Single Source Code**
- No separate builds for local vs production
- Same files work everywhere
- Easier maintenance

### ✅ **Automatic Detection**
- No environment variables needed
- No build-time configuration
- Pure client-side detection

### ✅ **Works for Both Teams**
- Developers: `npm start` → localhost works
- GitHub Pages: Automatic deployment works
- No conflicts between environments

---

## File Structure

```
qnd/src/public/
├── index.html          ← Dynamic base, relative paths
├── index-js.html       ← Dynamic base, relative paths
├── index-ts.html       ← Dynamic base, relative paths
├── js/
│   └── game.js         ← Loaded via: base + 'js/game.js'
├── ts/
│   └── components/     ← Source files
├── dist/
│   └── main.js         ← Built JS, loaded via: base + 'dist/main.js'
├── styles.css          ← Loaded via: base + 'styles.css'
└── manifest.json       ← Loaded via: base + 'manifest.json'
```

---

## Testing

### Local Development
```bash
cd qnd
npm start
# Opens: https://localhost:3443/
# Base path: /
# Links work: /js/ → /index-js.html
```

### GitHub Pages
```bash
git push origin dev/qnd2
# Deploys to: https://cerulean-circle-gmbh.github.io/UpDown/
# Base path: /UpDown/
# Links work: /UpDown/js/ → /UpDown/js/index.html
```

---

## How the `<base>` Tag Works

The HTML `<base>` element specifies the base URL for all relative URLs in a document.

**Example:**
```html
<base href="/UpDown/">
<link href="styles.css">  <!-- Resolves to: /UpDown/styles.css -->
<a href="js/">           <!-- Resolves to: /UpDown/js/ -->
<script src="dist/main.js"> <!-- Resolves to: /UpDown/dist/main.js -->
```

**Without base tag (localhost):**
```html
<link href="styles.css">  <!-- Resolves to: /styles.css -->
<a href="js/">           <!-- Resolves to: /js/ -->
<script src="dist/main.js"> <!-- Resolves to: /dist/main.js -->
```

---

## Browser Compatibility

The `<base>` tag is supported in:
- ✅ Chrome (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Edge (all versions)
- ✅ Opera (all versions)
- ✅ Mobile browsers

**Source:** [MDN - HTML base element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)

---

## Deployment Workflow

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy-pages.yml
- name: Build TypeScript with esbuild
  working-directory: ./qnd
  run: npm run build

- name: Copy game files to root for Jekyll
  run: |
    cp -r qnd/src/public/* .
    cp index-js.html js/index.html
    cp index-ts.html ts/index.html
```

The workflow:
1. ✅ Builds TypeScript → `dist/main.js`
2. ✅ Copies all files to root
3. ✅ Creates `js/index.html` and `ts/index.html`
4. ✅ Jekyll processes and deploys
5. ✅ Dynamic base path adjusts at runtime

---

## Common Patterns

### Adding New Resources

**✅ Correct (relative):**
```html
<link rel="stylesheet" href="new-style.css">
<script src="lib/helper.js"></script>
<img src="images/logo.png">
```

**❌ Incorrect (absolute):**
```html
<link rel="stylesheet" href="/UpDown/new-style.css">
<script src="/UpDown/lib/helper.js"></script>
<img src="/UpDown/images/logo.png">
```

### JavaScript Navigation

**✅ Correct (relative):**
```javascript
window.location.href = 'ts/';
```

**❌ Incorrect (hardcoded):**
```javascript
window.location.href = '/UpDown/ts/';
```

---

## Troubleshooting

### Issue: Resources not loading

**Check:**
1. Is the `<base>` tag present at the top of `<head>`?
2. Are all resource paths relative (no leading `/`)?
3. Is the file in the correct location relative to `index.html`?

### Issue: Links go to wrong place

**Check:**
1. Links should be relative: `href="js/"` not `href="/UpDown/js/"`
2. Base tag must come BEFORE any resource links
3. JavaScript redirects should use relative paths

### Issue: Works locally but not on GitHub Pages

**Check:**
1. Workflow built TypeScript (`npm run build`)
2. Workflow copied files to root
3. Jekyll processed the files
4. Check GitHub Actions logs for errors

---

## Future Improvements

### Potential Enhancements

1. **Service Worker Base Path**
   - Update `sw.js` to detect base path
   - Cache URLs with correct prefix

2. **PWA Manifest**
   - Generate manifest.json dynamically
   - Adjust start_url and scope

3. **Environment Variable**
   - Set `window.BASE_PATH` globally
   - Use in all scripts instead of hardcoding

---

## Summary

✅ **One source code** works everywhere  
✅ **Automatic detection** of environment  
✅ **No manual configuration** needed  
✅ **Simple maintenance** - update once, works everywhere  

**Local:** `npm start` → https://localhost:3443/  
**GitHub Pages:** Auto-deploy → https://cerulean-circle-gmbh.github.io/UpDown/  

**Same code. Different base paths. Both work perfectly.** 🎯
