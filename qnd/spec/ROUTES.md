# UpDown - Dual Version Routes

## Available Routes

### `/` - Version Selector
**Beautiful landing page** that lets users choose between JavaScript and TypeScript versions.

- Interactive cards for each version
- Feature list
- Auto-redirect support (`?v=js` or `?v=ts`)

### `/js` - JavaScript Version
**Classic implementation** using plain JavaScript.

- **Path**: `/js` → serves `index-js.html`
- **Script**: `js/game.js` (vanilla JavaScript)
- **Type**: Plain JS, no modules
- **Badge**: STABLE

### `/ts` - TypeScript Version
**Modern implementation** using TypeScript ESM modules.

- **Path**: `/ts` → serves `index-ts.html`
- **Scripts**: `ts/main.js` (compiled TypeScript ESM)
- **Modules**:
  - `ts/Card.ts` - Card class with types
  - `ts/GameModel.ts` - Game logic with interfaces
  - `ts/GameUI.ts` - UI handling
  - `ts/main.ts` - Entry point
- **Type**: TypeScript ESM modules
- **Badge**: MODERN

## File Structure

```
src/public/
├── index.html              # Route selector page
├── index-js.html           # JavaScript version
├── index-ts.html           # TypeScript version
├── styles.css              # Shared styles
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
│
├── js/                     # JavaScript Version
│   └── game.js             # All-in-one JS file
│
└── ts/                     # TypeScript Version
    ├── Card.ts             # Card class module
    ├── GameModel.ts        # Game logic module
    ├── GameUI.ts           # UI handling module
    └── main.ts             # Entry point
```

## Server Routing

Server routes in `src/ts/server/server.ts`:

```typescript
if (filepath === '/') {
  filepath = '/index.html';      // Version selector
} else if (filepath === '/js') {
  filepath = '/index-js.html';    // JavaScript version
} else if (filepath === '/ts') {
  filepath = '/index-ts.html';    // TypeScript version
}
```

## TypeScript Compilation

TypeScript files are executed directly by `tsx` in the browser.

**Note**: The `.ts` files are served as `.js` files. Modern browsers support ES modules natively.

The HTML imports use `.js` extension:
```html
<script type="module" src="ts/main.js"></script>
```

This works because:
1. TypeScript modules use `.js` extensions in imports
2. The server serves TypeScript files as JavaScript
3. Browser executes them as ES modules

## Key Differences

| Feature | JavaScript `/js` | TypeScript `/ts` |
|---------|-----------------|------------------|
| **Language** | Plain JS | TypeScript |
| **Modules** | No modules | ESM modules |
| **Types** | No types | Full type safety |
| **Files** | 1 file (game.js) | 4 modules |
| **Loading** | `<script src>` | `<script type="module">` |
| **Import/Export** | None | ES6 modules |
| **Compilation** | None | Runtime (tsx) |
| **Browser Support** | All browsers | Modern browsers |

## Usage

### Direct Access

```bash
# Version selector
https://localhost:3443/

# JavaScript version
https://localhost:3443/js

# TypeScript version
https://localhost:3443/ts
```

### Query Parameters

```bash
# Auto-redirect to JavaScript
https://localhost:3443/?v=js

# Auto-redirect to TypeScript
https://localhost:3443/?v=ts
```

## Benefits of Dual Routes

### JavaScript Version (`/js`)
✅ **Pros:**
- Maximum compatibility
- Single file (easy to understand)
- No compilation needed
- Works on older browsers

❌ **Cons:**
- No type safety
- No module organization
- Harder to maintain as it grows

### TypeScript Version (`/ts`)
✅ **Pros:**
- Full type safety
- Modular organization
- Better IDE support
- Cleaner code structure
- Easier to extend

❌ **Cons:**
- Requires modern browser
- More files to manage
- Slightly more complex

## Development

### Working with JavaScript

```bash
# Edit
nano src/public/js/game.js

# No compilation needed
# Just reload browser
```

### Working with TypeScript

```bash
# Edit modules
nano src/public/ts/Card.ts
nano src/public/ts/GameModel.ts
nano src/public/ts/GameUI.ts
nano src/public/ts/main.ts

# TypeScript is executed directly by tsx
# Just reload browser
```

## Adding New Features

### To JavaScript Version
1. Edit `src/public/js/game.js`
2. Add code to the appropriate class
3. Reload browser

### To TypeScript Version
1. Create new module in `src/public/ts/`
2. Export types and classes
3. Import in other modules
4. Update imports with `.js` extension
5. Reload browser

## Future Enhancements

- [ ] Add build step for TypeScript (esbuild/vite)
- [ ] Minification for production
- [ ] Source maps for debugging
- [ ] Hot module replacement
- [ ] Separate PWA manifests per version
- [ ] Version-specific service workers

