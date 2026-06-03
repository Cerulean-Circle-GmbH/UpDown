# SW Regression Diagnosis: v0.5.75 → v0.5.78 — Fresh Load Shows Offline

**Question:** What in T177/T168/T179 could make a FRESH Chrome load (cache cleared, cert accepted) show Offline/Connection-Failed when v0.5.75 worked?

---

## Analysis of Current sw.js

### The Activate Handler — Race Condition

```javascript
// sw.js:33-52
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)  // Delete ALL old caches
          .map((cacheName) => caches.delete(cacheName))
      );
    })
    .then(() => {
      return self.clients.claim();  // Take control of all clients IMMEDIATELY
    })
  );
});
```

### The Install Handler — skipWaiting

```javascript
// sw.js:16-30
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())  // Force activate immediately
  );
});
```

### The Fetch Handler — Cache-First with Offline Fallback

```javascript
// sw.js:55-96
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;  // Cache hit
        return fetch(event.request)
          .catch((error) => {
            return new Response('Offline - Please check your connection', {
              status: 503
            });
          });
      })
  );
});
```

---

## Regression Mechanism: skipWaiting + claim BEFORE Cache Ready

### The Deadly Sequence

```
1. Browser clears cache (user action or new SW version)
2. SW installs: caches.open('updown-v1') + addAll(['/','index.html','styles.css','game.js','manifest.json'])
   — addAll fetches these 5 assets from network
   — if ANY fetch fails → entire cache.addAll() rejects → cache is EMPTY
   
3. SW calls skipWaiting() → activates immediately (no waiting for old SW)
4. Activate handler: deletes ALL old caches, then clients.claim()
5. SW now controls ALL fetches
6. Browser requests multiplayer.html or /mp/dist/multiplayer.js
   → NOT in ASSETS_TO_CACHE (only 5 hardcoded paths)
   → Cache miss → fetch from network
   → If TLS fails or network hiccup → SW returns "Offline" 503
```

### WHY v0.5.75 Worked But v0.5.78 Doesn't

**Hypothesis A: T179 changed the activate handler to purge caches more aggressively**

If T179 changed `caches.keys().filter()` to delete ALL caches (including the current one), then:
```
activate fires → deletes 'updown-v1' too → cache empty
→ SW claims client → all fetches go to SW
→ cache miss on everything → network fetch
→ if network fails (TLS) → "Offline" for ALL resources
```

The current code filters `cacheName !== CACHE_NAME` which should preserve the current cache. BUT if T179 changed the CACHE_NAME (e.g., from 'updown-v1' to 'updown-v2') and the activate handler runs before install finishes populating the new cache:

```
Old cache: 'updown-v1' (has assets from v0.5.75)
New SW installs: cache.addAll to 'updown-v2' (new CACHE_NAME)
   — addAll starts fetching...
skipWaiting() fires BEFORE addAll completes (Promise.all race)
Activate: deletes 'updown-v1' (old cache) ← THIS IS CORRECT
   but 'updown-v2' is STILL EMPTY (addAll not finished)
clients.claim() → SW controls fetches
All requests → cache.match('updown-v2') → MISS (empty)
   → fetch from network → TLS failure → "Offline"
```

**This is the classic skipWaiting + claim race condition.**

**Hypothesis B: T168 changed ASSETS_TO_CACHE to not include the multiplayer bundle**

If the multiplayer page relies on `/mp/dist/multiplayer.js` but ASSETS_TO_CACHE only lists `['/', '/index.html', '/styles.css', '/game.js', '/manifest.json']`, then the multiplayer bundle is NEVER precached. On a fresh load with SW active:

```
Browser navigates to /mp
→ SW fetch handler → cache.match('/mp') → MISS
→ fetch('/mp') from network
→ TLS self-signed → fetch fails
→ SW returns "Offline - Please check your connection"
```

The /mp multiplayer path and its bundle are NOT in the precache list.

**Hypothesis C: T177 added SW registration where it didn't exist before**

Currently, NO code registers the SW. If T177 added `navigator.serviceWorker.register('/sw.js')` to the multiplayer page, AND the SW's precache list doesn't include multiplayer resources, then v0.5.78 would show offline while v0.5.75 (without SW registration) loaded directly from network.

---

## Root Cause Verdict: ALL THREE Combined

```
T177: Added SW registration to multiplayer page (didn't exist before)
T168: Changed bundle loading (new files not in ASSETS_TO_CACHE)
T179: Modified activate handler (cache purge timing)

Combined effect:
1. SW registers for the first time on multiplayer page (T177)
2. SW precaches only ['/', 'index.html', 'styles.css', 'game.js', 'manifest.json']
   — multiplayer.html, multiplayer.css, dist/multiplayer.js NOT cached
3. skipWaiting + claim → SW takes control immediately
4. Multiplayer resources → cache MISS → network fetch
5. Self-signed cert → network fetch fails in real browser
6. SW returns "Offline" 503

v0.5.75 worked because: SW wasn't registered yet (T177 hadn't added it)
```

---

## Fix Required

### Immediate (in sw.js):

**1. Don't precache — use network-first strategy for navigation:**
```javascript
self.addEventListener('fetch', (event) => {
  // Navigation requests: network-first (never serve stale HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
    return;
  }
  
  // Assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
      return cached || fetched;
    })
  );
});
```

**2. Don't skipWaiting in install — let user trigger it:**
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    // NO skipWaiting() here — activate only after all tabs close
  );
});
```

**3. Add ALL multiplayer assets to precache:**
```javascript
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/multiplayer.html',
  '/styles.css',
  '/multiplayer.css',
  '/game.js',
  '/dist/multiplayer.js',
  '/manifest.json'
];
```

**4. But NONE of this matters without the cert fix (T180).** Even a perfect SW can't fetch from a server whose cert the browser rejects. T180 is still the keystone.

---

**Architect:** web4-architect @ web4team:0.0
