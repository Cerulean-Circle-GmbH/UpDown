[Back to Sprint 3 Planning](./planning.md)

# Task 180: KEYSTONE — Let's Encrypt Real Cert for home.donges.it
[task:uuid:d4e5f6a7-b8c9-0123-def4-180000000001]

**THE blocker.** Nothing reaches Tron's device without a trusted cert.

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement (this design)
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

---

## Network Recon (measured, not assumed)

| Endpoint | Status | What's there |
|----------|--------|-------------|
| `home.donges.it` DNS | ✅ Resolves to 87.123.36.135 | DynDNS via kasserver.com NS |
| `:80` HTTP | ✅ 200 — serves Fritz!Box login page | Fritz!Box web UI owns :80 |
| `:3000` HTTP | ❌ Unreachable from outside | Not port-forwarded |
| `:3443` HTTPS | ✅ 200 — serves game (self-signed) | Port-forwarded to MacStudio |
| `:443` HTTPS | Not tested | Likely Fritz!Box or closed |

**DNS provider:** kasserver.com (ns5/ns6.kasserver.com) — All-Inkl managed hosting.

---

## (1) ACME Challenge Method

### HTTP-01 Challenge — BLOCKED
Requires serving `http://home.donges.it:80/.well-known/acme-challenge/<token>`.
Port 80 is owned by Fritz!Box web UI. Our game server can't bind :80.

**Could work IF:** Fritz!Box has a reverse proxy to forward `/.well-known/acme-challenge/` to MacStudio. Most Fritz!Box models do NOT support path-based reverse proxy. **Requires Tron to check.**

### DNS-01 Challenge — FEASIBLE ✅
Requires creating a TXT record `_acme-challenge.home.donges.it` with a challenge token.

**All-Inkl (kasserver.com) supports DNS API:** All-Inkl KAS provides an API for DNS record management. The `acme.sh` client has a built-in `dns_kas` plugin for All-Inkl.

```bash
# acme.sh with All-Inkl KAS API
export KAS_Login="<all-inkl-login>"
export KAS_Authtype="sha1"
export KAS_Authdata="<all-inkl-password-sha1>"

acme.sh --issue -d home.donges.it --dns dns_kas
```

**Alternative:** Manual DNS-01 with certbot:
```bash
certbot certonly --manual --preferred-challenges dns -d home.donges.it
# certbot shows: Create TXT record _acme-challenge.home.donges.it = <token>
# Tron creates the TXT record in All-Inkl KAS panel
# certbot verifies and issues cert
```

**Recommendation: DNS-01 via acme.sh + dns_kas plugin** — fully automated, no port 80 needed, auto-renewal works.

---

## (2) acme.sh Setup + Auto-Renewal

### Install (on MacStudio — the server host)

```bash
curl https://get.acme.sh | sh
# or
brew install acme.sh
```

### Issue Certificate

```bash
# Set All-Inkl KAS credentials (Tron provides these)
export KAS_Login="donges"  # All-Inkl KAS login
export KAS_Authtype="sha1"
export KAS_Authdata="<sha1-of-kas-password>"

# Issue cert via DNS-01
acme.sh --issue -d home.donges.it --dns dns_kas \
  --key-file /Users/Shared/Workspaces/AI/Claude.All/UpDown/qnd/src/ts/server/.certs/key.pem \
  --cert-file /Users/Shared/Workspaces/AI/Claude.All/UpDown/qnd/src/ts/server/.certs/cert.pem \
  --fullchain-file /Users/Shared/Workspaces/AI/Claude.All/UpDown/qnd/src/ts/server/.certs/fullchain.pem \
  --reloadcmd "pkill -HUP -f 'node.*server'" 
```

### Auto-Renewal

acme.sh installs a cron job automatically:
```
0 0 * * * /Users/donges/.acme.sh/acme.sh --cron --home /Users/donges/.acme.sh
```

Every 60 days, acme.sh:
1. Creates TXT record via KAS API
2. Let's Encrypt validates
3. New cert written to .certs/
4. `--reloadcmd` sends SIGHUP to server → server reloads cert

---

## (3) Server TLS Config Changes

### Current (broken):
```typescript
// server.ts:590
const cmd = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
  -keyout "${KEY_FILE}" -out "${CERT_FILE}" \
  -subj "/CN=localhost"`;
```

### Required changes:

**A. Read fullchain (not just cert):**
```typescript
const CERT_DIR = path.join(__dirname, '.certs');
const KEY_FILE = path.join(CERT_DIR, 'key.pem');
const CERT_FILE = path.join(CERT_DIR, 'fullchain.pem');  // ← CHANGED: fullchain includes CA chain
```

Let's Encrypt certs need the full chain (cert + intermediate CA). Without it, some devices reject the cert even though the leaf is valid.

**B. Remove self-signed generation as primary — keep as fallback:**
```typescript
async function ensureCertificate(): Promise<boolean> {
  // Check for Let's Encrypt cert first
  if (fsSync.existsSync(path.join(CERT_DIR, 'fullchain.pem')) && 
      fsSync.existsSync(KEY_FILE)) {
    return true;
  }
  
  // Fallback: Check for self-signed (dev only)
  if (fsSync.existsSync(CERT_FILE) && fsSync.existsSync(KEY_FILE)) {
    console.warn('⚠️  Using self-signed cert — real browsers will reject WSS');
    return true;
  }
  
  // Last resort: generate self-signed for localhost dev
  return generateSelfSignedCert();
}
```

**C. Cert reload on SIGHUP (for auto-renewal):**
```typescript
let httpsServer: https.Server;

process.on('SIGHUP', async () => {
  console.log('🔄 Reloading TLS certificate...');
  try {
    const [key, cert] = await Promise.all([
      fs.readFile(KEY_FILE, 'utf-8'),
      fs.readFile(path.join(CERT_DIR, 'fullchain.pem'), 'utf-8')
    ]);
    httpsServer.setSecureContext({ key, cert });
    console.log('✅ TLS certificate reloaded');
  } catch (error) {
    console.error('❌ Failed to reload cert:', error);
  }
});
```

**D. Serve on :443 instead of :3443 (optional but recommended):**
Port 3443 requires users to type `https://home.donges.it:3443`. Port 443 is the default — just `https://home.donges.it`. Requires Tron to port-forward :443 to MacStudio instead of :3443.

---

## (4) What Needs Tron vs What We Can Do

### TRON MUST DO (we cannot):

| # | Action | Why | How |
|---|--------|-----|-----|
| T1 | **Provide All-Inkl KAS credentials** | acme.sh needs KAS API access for DNS-01 | KAS login + password (we hash to SHA1 locally) |
| T2 | **Verify DNS-01 works** | First issuance may need manual TXT record as test | KAS panel → DNS → add TXT `_acme-challenge.home.donges.it` |
| T3 | **Port-forward :443 → MacStudio** (optional) | Lets users access without :3443 suffix | Fritz!Box → Port Forwarding → 443 → MacStudio:3443 |
| T4 | **Install mkcert CA on iPhone** (if using mkcert instead) | Only needed for mkcert path | Safari → navigate to CA URL → install profile → trust |

### WE CAN DO (no Tron needed):

| # | Action |
|---|--------|
| E1 | Install acme.sh on MacStudio |
| E2 | Update server.ts: fullchain.pem, SIGHUP reload, cert priority |
| E3 | Configure acme.sh with KAS credentials (once Tron provides T1) |
| E4 | Issue cert + verify |
| E5 | Test from real Safari (no --ignore-certificate-errors) |
| E6 | Verify WSS connects with LE cert |
| E7 | Verify SW update fetches new /sw.js |

### Sequence

```
Tron: T1 (credentials)
  → Expert: E1+E2+E3 (install + config)
    → Expert: E4 (issue cert)
      → Expert: E5+E6+E7 (verify real browser)
        → Tron: T3 (optional :443 forward)
          → DONE — Tron's device works
```

**Critical path: T1 (credentials).** Everything else is blocked on it.

---

## Acceptance Criteria
- [ ] AC-1: `acme.sh --issue -d home.donges.it --dns dns_kas` succeeds
- [ ] AC-2: `.certs/fullchain.pem` contains Let's Encrypt cert + chain
- [ ] AC-3: `openssl s_client -connect home.donges.it:3443` shows `Verify return code: 0 (ok)`
- [ ] AC-4: Real Safari (no bypass flags) loads `https://home.donges.it:3443` without warning
- [ ] AC-5: WSS connects in real Safari — "Connection Failed" resolved
- [ ] AC-6: SW update: fresh load gets v0.5.78 SW (not stuck on v0.2.12)
- [ ] AC-7: Auto-renewal cron job installed and tested
- [ ] AC-8: Server reloads cert on SIGHUP without restart

---

**Architect:** web4-architect @ web4team:0.0
**Sprint:** Sprint 3 — QnD Multiplayer Game
**Blocks:** ALL user-facing functionality on Tron's device
