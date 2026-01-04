# ONCE v0.3.22.1 — Functional PWA File Browser

**Component**: ONCE  
**Version**: 0.3.22.1 (Frozen)  
**Build Date**: 2026-01-04  
**Status**: ✅ **STABLE RELEASE** — PWA File Browser Functional  
**Architecture**: Radical OOP + Web4 Principles + ISR Pattern

---

## 🎯 Release Summary

**ONCE 0.3.22.1** delivers a **fully functional Progressive Web App (PWA) File Browser** with proper CSS theming, SPA routing, and IOR-based resource loading. This release freezes a major milestone: the complete Web4 architecture for hierarchical file/folder navigation.

### Key Achievements

| Feature | Status | Description |
|---------|--------|-------------|
| **FileBrowser PWA** | ✅ | Navigate `/EAMD.ucp/components/` and `/EAMD.ucp/scenarios/` |
| **SPA Architecture** | ✅ | All routes via `once.html` + `UcpRouter` |
| **IOR Infrastructure** | ✅ | Universal resource loading (85% complete) |
| **File/Folder OOP** | ✅ | `DefaultFile`/`DefaultFolder` with ISR pattern |
| **Unit Descriptors** | ✅ | 540+ units in `ONCE.component.json` |
| **CSS Theming** | ✅ | Green-on-black terminal theme working |
| **Cache Busting** | ✅ | SW versioning with network-first strategy |

---

## 🆕 What's New in 0.3.22.1

### **1. Functional PWA File Browser** ✅

Browse the EAMD.ucp virtual filesystem directly in the browser:

```
https://localhost:42777/EAMD.ucp
├── components/     → Browse all Web4 components
│   ├── ONCE/0.3.22.1/
│   ├── Unit/0.3.19.1/
│   └── ...
└── scenarios/      → Browse all scenarios by path
    ├── type/ONCE/0.3.22.1/
    └── domain/.../
```

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-31-UTC-0900.fs-operations-filebrowser-pwa.pdca.md) | [§/session/2025-12-31-UTC-0900.fs-operations-filebrowser-pwa.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-31-UTC-0900.fs-operations-filebrowser-pwa.pdca.md)

---

### **2. SPA Route Unification** ✅

All routes now use a single entry point (`once.html`) with `UcpRouter` for view selection:

| Route | View | Description |
|-------|------|-------------|
| `/` | `<folder-over-view>` | Main folder view |
| `/demo` | `<once-over-view>` | ONCE peer demo hub |
| `/EAMD.ucp` | `<folder-over-view>` | Virtual root (components + scenarios) |
| `/EAMD.ucp/components/...` | `<folder-over-view>` | Component browser |

**Before** (multiple HTML files):
```typescript
// ❌ Separate HTML files with duplicate asset loading
demoRoute.setProvider(() => this.component!.serveDemoLit());
```

**After** (unified SPA):
```typescript
// ✅ Single entry point, UcpRouter decides view
demoRoute.setProvider(() => this.component!.serveOnceApp());
// UcpRouter: /demo → <once-over-view>
```

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2026-01-02-UTC-1750.demo-route-spa-unification.pdca.md) | [§/session/2026-01-02-UTC-1750.demo-route-spa-unification.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2026-01-02-UTC-1750.demo-route-spa-unification.pdca.md)

---

### **3. File/Folder Radical OOP Architecture** ✅

Complete OOP encapsulation of filesystem operations with lazy loading:

```typescript
// DefaultFile - Layer 2 implementation
const file = new DefaultFile().init();
file.model.path = '/path/to/file.txt';
const content = await file.read();           // IOR-based loading
await file.write('new content');             // IOR-based saving

// DefaultFolder - Layer 2 implementation  
const folder = new DefaultFolder().init();
folder.model.path = '/path/to/folder';
const children = await folder.childrenLoad(); // Lazy loading
await folder.childAdd(newFile);               // ISR pattern
```

**Key Patterns**:
- **ISR (IOR Self-Replacement)**: Lazy references resolve themselves
- **JsInterface (P35)**: Runtime type information for `RelatedObjects`
- **Collection<T>**: Generic lazy collections for children

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md) | [§/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)

---

### **4. IOR Infrastructure (85% Complete)** ✅

Universal resource access through Internet Object References:

```typescript
// All resource access via IOR - NO fetch(), NO fs functions
const data = await IOR.load('ior:file:///path/to/file');
await IOR.save('ior:file:///path/to/file', content);

// Loader chain resolves protocols automatically
// file:// → FileLoader (Node.js) / HTTPSLoader (Browser)
// https:// → HTTPSLoader
// ws:// → WebSocketLoader
```

**Completed**:
- ✅ Reference/IOR consolidation (single `layer4/IOR.ts`)
- ✅ Loader chain (HTTPSLoader, FileLoader, ScenarioLoader, WebSocketLoader)
- ✅ CSS preloader with retry logic
- ✅ Unit-based caching
- ✅ Fetch centralization (P7 down to 2 allowed exceptions)

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md) | [§/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md)

---

### **5. Unit-Based Component Descriptor** ✅

540+ units tracked in `ONCE.component.json` for PWA caching:

```json
{
  "ior": { "component": "ONCE", "version": "0.3.22.1" },
  "model": {
    "units": [
      "src/ts/layer1/ONCE.ts",
      "src/ts/layer2/NodeJsOnce.ts",
      "src/ts/layer5/views/css/themeBase.css",
      "package.json",
      "src/sh/build.sh",
      "src/assets/icon-512.svg"
      // ... 534 more units
    ]
  }
}
```

**Unit Types**:
- TypeScript source files (`.ts`)
- CSS stylesheets (`.css`)  
- Shell scripts (`.sh`)
- Assets (`.svg`, `.png`)
- Configuration (`package.json`, `vitest.config.ts`)
- Folder markers (`°folder.unit`)

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-21-UTC-1900.unit-based-descriptor-generation.pdca.md) | [§/session/2025-12-21-UTC-1900.unit-based-descriptor-generation.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-21-UTC-1900.unit-based-descriptor-generation.pdca.md)

---

### **6. Cache Busting & Service Worker** ✅

Systematic cache invalidation with dynamic SW versioning:

```typescript
// Service Worker version from script URL
const version = '0.3.22.1';  // Extracted from /EAMD.ucp/components/ONCE/0.3.22.1/...
const cacheName = `once-cache-${version}-${buildTimestamp}`;

// Network-first with adaptive fallback
async function handleFetch(event) {
  const networkResponse = await fetch(event.request);
  if (networkResponse.ok) {
    cache.put(event.request, networkResponse.clone());
  }
  return networkResponse;
}
```

**Features**:
- Dynamic version extraction from URL
- Build timestamp for cache busting
- Network-first caching strategy
- `Cache-Control: no-cache` for JS during development
- `/cache-clear` endpoint for manual invalidation

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2026-01-02-UTC-1400.cache-busting-systematic-fix.pdca.md) | [§/session/2026-01-02-UTC-1400.cache-busting-systematic-fix.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2026-01-02-UTC-1400.cache-busting-systematic-fix.pdca.md)

---

### **7. CSS Theming System** ✅

Scoped CSS with Shadow DOM and `adoptedStyleSheets`:

```typescript
// UcpView base class handles CSS loading
class MyView extends UcpView<Model> {
  static cssUrls = ['/path/to/styles.css'];
  
  // CSS loaded via IOR, cached, injected into Shadow DOM
}
```

**Theme**: Green-on-black terminal aesthetic
- `themeBase.css` — Foundation styles
- `OnceOverView.css` — Peer list styling
- `DefaultItemView.css` — Item styling
- `FolderOverView.css` — Folder navigation

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-14-UTC-1700.css-theming-architecture.pdca.md) | [§/session/2025-12-14-UTC-1700.css-theming-architecture.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-14-UTC-1700.css-theming-architecture.pdca.md)

---

### **8. Scenario Housekeeping** ✅

Graceful peer shutdown with state tracking:

```typescript
// ONCEPeerModel now includes shutdownTime
interface ONCEPeerModel extends Model {
  state: LifecycleState;
  shutdownTime?: string;  // ISO 8601 timestamp
}

// NodeJsOnce marks scenario as SHUTDOWN (not deleted)
async _stopPeerInternal() {
  this.model.state = LifecycleState.SHUTDOWN;
  this.model.shutdownTime = new Date().toISOString();
  await this.scenarioManager.saveScenario(this.toScenario());
}

// Housekeeping cleans up old SHUTDOWN scenarios (>24h)
```

**PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md) | [§/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md)

---

## 🚀 Quick Start

### **Build & Start**

```bash
cd /Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1

# Build
./once build

# Start primary server
./once peerStart primary

# Access in browser
open https://localhost:42777/EAMD.ucp
```

### **Available Routes**

| URL | Description |
|-----|-------------|
| `https://localhost:42777/` | Main file browser |
| `https://localhost:42777/demo` | ONCE peer demo hub |
| `https://localhost:42777/EAMD.ucp` | Virtual root browser |
| `https://localhost:42777/health` | Server health check |
| `https://localhost:42777/servers` | Client servers list |
| `https://localhost:42777/cache-clear` | Clear browser caches |

### **Testing**

```bash
# Run Tootsie tests
./once tootsie file 2   # Test02_DemoPagePlaywright (10 DEMO tests)

# Manual testing
./once peerStart
curl -k https://localhost:42777/health
```

---

## 📊 Architecture Overview

### **Layer Structure**

```
src/ts/
├── layer1/   # Infrastructure (ONCE.ts, Path.ts)
├── layer2/   # Implementation (NodeJsOnce, DefaultFile, DefaultFolder)
├── layer3/   # Interfaces (ONCEPeerModel, FileModel, FolderModel)
├── layer4/   # Orchestrators (IOR, FileOrchestrator, BrowserOnceOrchestrator)
└── layer5/   # Views (UcpView, FolderOverView, OnceOverView, CLI)
```

### **Key Components**

| Component | Layer | Purpose |
|-----------|-------|---------|
| `NodeJsOnce` | 2 | Node.js ONCE kernel |
| `BrowserOnce` | 2 | Browser ONCE kernel |
| `DefaultFile` | 2 | File OOP operations |
| `DefaultFolder` | 2 | Folder OOP operations |
| `IOR` | 4 | Internet Object Reference |
| `FileOrchestrator` | 4 | File/Folder orchestration |
| `BrowserOnceOrchestrator` | 4 | Browser routing & views |
| `UcpRouter` | 4 | SPA route resolution |
| `UcpView` | 5 | Base view with CSS injection |
| `FolderOverView` | 5 | File browser UI |
| `OnceOverView` | 5 | Peer demo UI |

### **Web4 Patterns Used**

| Pattern | Location | Description |
|---------|----------|-------------|
| **Radical OOP** | All layers | Empty constructors, `init(scenario)` |
| **ISR** | Layer 4 | IOR Self-Replacement for lazy refs |
| **JsInterface (P35)** | Layer 3 | Runtime type info for polymorphism |
| **Reference<T>** | Models | Type-safe nullable references |
| **Collection<T>** | Models | Lazy-loaded child collections |
| **UcpModel** | Models | Reactive proxy for view updates |

---

## 📚 Web4 Principles Applied

This release demonstrates compliance with **27 Web4 Principles**:

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| P1 | Separation of Concerns | ✅ | 5-layer architecture |
| P4 | Radical OOP | ✅ | No arrow functions in methods |
| P5 | Reference<T> | ✅ | Type-safe nullables |
| P7 | DRY Fetch | ✅ | 2 allowed exceptions (SW) |
| P8 | DRY | ✅ | Delegation pattern |
| P12 | IOR-based | ✅ | All resources via IOR |
| P16 | nameVerb Accessors | ✅ | TypeScript getters/setters |
| P20 | ESM Only | ✅ | No `require()` |
| P26 | Factory Pattern | ✅ | `new Class().init(scenario)` |
| P33 | CSS External | ✅ | Styles in `.css` files only |
| P35 | JsInterface | ✅ | Runtime type descriptors |

**Full Checklist**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-principles-checklist.md) | [§/session/web4-principles-checklist.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/web4-principles-checklist.md)

---

## 📂 Session Documentation

This release includes extensive PDCA documentation covering all development work:

### **Major Feature PDCAs**

| Feature | PDCA |
|---------|------|
| **Iteration Tracking** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md) \| [§/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md) |
| **File/Folder Architecture** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md) \| [§/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md) |
| **IOR Infrastructure** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md) \| [§/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md) |
| **Component Descriptor** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md) \| [§/session/2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md) |
| **FileBrowser PWA** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-31-UTC-0900.fs-operations-filebrowser-pwa.pdca.md) \| [§/session/2025-12-31-UTC-0900.fs-operations-filebrowser-pwa.pdca.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/2025-12-31-UTC-0900.fs-operations-filebrowser-pwa.pdca.md) |

### **Architectural Patterns**

| Pattern | Documentation |
|---------|---------------|
| **ISR Pattern** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-isr-lazy-load-pattern.md) \| [§/session/web4-isr-lazy-load-pattern.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/web4-isr-lazy-load-pattern.md) |
| **JsInterface Pattern** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-jsinterface-pattern.md) \| [§/session/web4-jsinterface-pattern.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/web4-jsinterface-pattern.md) |
| **Component Anatomy** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-component-anatomy-checklist.md) \| [§/session/web4-component-anatomy-checklist.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/web4-component-anatomy-checklist.md) |
| **Learning Log** | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/learning.md) \| [§/session/learning.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/learning.md) |

---

## 📈 Metrics

### **Code Changes**

| Metric | Value |
|--------|-------|
| **Files Modified** | 50+ |
| **Lines Added** | ~5,000 |
| **Lines Removed** | ~2,000 |
| **New PDCAs** | 56 |
| **Units in Descriptor** | 540 |
| **Tootsie Tests** | 10 (DEMO-01 to DEMO-10) |

### **Web4 Compliance**

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `./once build` | ✅ Exit 0 |
| `./once tootsie file 2` | ✅ 10/10 Pass |
| P7 Violations (fetch) | ✅ 2 (allowed) |
| P20 Violations (require) | ✅ 0 |

---

## 🔄 Migration from 0.3.22.0

### **Breaking Changes**

None — this is a feature release.

### **New Dependencies**

None — all features use existing infrastructure.

### **Deprecations**

| Deprecated | Replacement | Notes |
|------------|-------------|-------|
| `demo-lit.html` | `once.html` + UcpRouter | SPA unification |
| Multiple entry points | Single `serveOnceApp()` | DRY compliance |

---

## 🔮 Carried Forward to 0.3.22.2

The following work continues in the next version:

| Task | Status | Description |
|------|--------|-------------|
| **FFM.4a** | 80% | Scenario housekeeping (fs→OOP remaining) |
| **ISR Tracking** | Postponed | `model.awaitResolved()` |
| **HTTPS.PWA** | Queued | H.4, H.5 LetsEncrypt UI |
| **ActionBar** | Queued | Dynamic action display |

---

## 📄 License

Part of the Web4 ecosystem — Cerulean Circle GmbH

---

## 🤝 Acknowledgments

Developed with Claude Opus 4.5 using:
- **CMM3** — Capability Maturity Model Level 3
- **Fractal PDCA** — Iterative planning methodology
- **Web4 Principles** — 27 architectural guidelines
- **Tootsie Testing** — Object-oriented test framework

---

**"Never 2 1 (TO ONE). Always 4 2 (FOR TWO)."** 🤝✨

---

**Version**: 0.3.22.1 (Frozen)  
**Next Version**: 0.3.22.2 (Active Development)  
**Architecture**: ✅ Radical OOP + Web4 Compliant  
**PWA**: ✅ Functional File Browser
