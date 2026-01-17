# Task 7: HTTPS.PWA H.4-H.5 LetsEncrypt Integration

**Status:** 📋 PLANNED
**Priority:** 3 (Medium - User-Facing Feature)
**Estimated Time:** 2.5 hours
**Assignee:** TBD
**Sprint:** 30

---

## **Objective**

Complete HTTPS.PWA integration by implementing LetsEncrypt UI action button (H.4) and wiring CertificateOrchestrator with fallback logic (H.5), achieving production-ready HTTPS with automated certificate management.

---

## **Background**

From [2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md](../../components/ONCE/0.3.21.8/session/2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md):

**Current State (H.1-H.3 ✅):**
- ✅ H.1: Self-signed certificate generator working
- ✅ H.2: HTTP→HTTPS redirect (42000→42777) functional
- ✅ H.3: All servers HTTPS by default

**Remaining Work (H.4-H.5):**
- H.4: LetsEncrypt UI action button
- H.5: CertificateOrchestrator integration with fallback

---

## **Requirements**

### **H.4: LetsEncrypt UI Action Button (~1h)**

- [ ] Add "Get Certificate" button to OnceOverView.ts
- [ ] Show "Renew Certificate" when certificate exists and near expiry
- [ ] Button triggers CertificateOrchestrator via IOR call
- [ ] Display certificate status (valid, expiring soon, expired)
- [ ] Show progress indicator during certificate acquisition

**UI Requirements:**
```
┌─────────────────────────────────┐
│ HTTPS Status: ✅ Active         │
│ Certificate: Let's Encrypt      │
│ Expires: 2026-04-15 (88 days)   │
│                                 │
│ [Renew Certificate] [Details]   │
└─────────────────────────────────┘
```

### **H.5: CertificateOrchestrator Integration (~1.5h)**

- [ ] Wire button to CertificateOrchestrator.acquireCertificate()
- [ ] Implement fallback chain:
  1. Try LetsEncrypt acquisition
  2. If fails, use self-signed certificate
  3. Log failure reason for debugging
- [ ] Handle domain validation requirements
- [ ] Implement certificate auto-renewal logic
- [ ] Store certificate metadata in scenario

**Fallback Logic:**
```typescript
async acquireCertificate(): Promise<Certificate> {
  try {
    // 1. Try LetsEncrypt
    return await this.getLetsEncryptCert();
  } catch (error) {
    console.warn('LetsEncrypt failed, using self-signed', error);
    // 2. Fallback to self-signed
    return await this.generateSelfSignedCert();
  }
}
```

---

## **Acceptance Criteria**

1. **UI Functionality:**
   - "Get Certificate" button visible in OnceOverView
   - Button click triggers certificate acquisition
   - Progress indicator shows during operation
   - Success/failure message displayed
   - Certificate status updates in UI

2. **CertificateOrchestrator:**
   - LetsEncrypt integration functional
   - Self-signed fallback works
   - Certificate renewal logic implemented
   - Domain validation handled
   - Error states properly managed

3. **Testing:**
   - Unit tests for CertificateOrchestrator
   - Integration test: button → certificate acquisition
   - Manual test: click button, verify cert installed
   - Manual test: force LetsEncrypt failure, verify fallback
   - Manual test: verify HTTPS with acquired cert

4. **Documentation:**
   - PDCA entry marked H.4-H.5 complete
   - User guide for certificate management
   - Error troubleshooting guide

---

## **Technical Approach**

### **H.4: UI Button Implementation**

**File:** `components/ONCE/0.3.22.2/src/layer5/views/OnceOverView.ts`

```typescript
render() {
  return html`
    <section class="https-section">
      <h3>🔒 HTTPS Certificate</h3>
      <div class="cert-status">
        ${this.renderCertificateStatus()}
      </div>
      <div class="cert-actions">
        ${this.renderCertificateActions()}
      </div>
    </section>
  `;
}

renderCertificateActions() {
  const cert = this.model.certificate;
  if (!cert || this.isExpiringSoon(cert)) {
    return html`
      <button @click=${this.acquireCertificate}>
        ${cert ? 'Renew Certificate' : 'Get Certificate'}
      </button>
    `;
  }
  return html`<span>Certificate valid</span>`;
}

async acquireCertificate() {
  this.loading = true;
  try {
    const cert = await IOR.call(
      'CertificateOrchestrator',
      'acquireCertificate'
    );
    this.model.certificate = cert;
    this.showSuccess('Certificate acquired');
  } catch (error) {
    this.showError('Certificate acquisition failed: ' + error.message);
  } finally {
    this.loading = false;
  }
}
```

### **H.5: CertificateOrchestrator Wiring**

**File:** `components/ONCE/0.3.22.2/src/layer4/CertificateOrchestrator.ts`

```typescript
async acquireCertificate(): Promise<Certificate> {
  // 1. Try LetsEncrypt
  try {
    return await this.acquireLetsEncrypt();
  } catch (letsEncryptError) {
    this.logError('LetsEncrypt failed', letsEncryptError);

    // 2. Fallback to self-signed
    return await this.generateSelfSigned();
  }
}

async acquireLetsEncrypt(): Promise<Certificate> {
  // Validate domain is accessible
  await this.validateDomain(this.model.domain);

  // Use acme library for LetsEncrypt
  const cert = await this.acmeClient.getCertificate({
    domain: this.model.domain,
    email: this.model.email,
    challengeType: 'http-01'
  });

  // Store certificate
  await this.storeCertificate(cert);

  return cert;
}

async generateSelfSigned(): Promise<Certificate> {
  // Use existing self-signed logic from H.1
  const cert = await this.selfSignedGenerator.generate({
    domain: this.model.domain,
    validDays: 365
  });

  await this.storeCertificate(cert);

  return cert;
}
```

---

## **Dependencies**

### **Prerequisites:**
- ✅ H.1: Self-signed cert generator exists
- ✅ H.2: HTTPS redirect working
- ✅ H.3: HTTPS default configuration

### **External:**
- LetsEncrypt acme library (likely acme-client)
- Domain must be publicly accessible for validation
- HTTP-01 challenge requires port 80 accessible

---

## **Files to Modify**

**Primary:**
- `components/ONCE/0.3.22.2/src/layer4/CertificateOrchestrator.ts` (H.5)
- `components/ONCE/0.3.22.2/src/layer5/views/OnceOverView.ts` (H.4)

**Supporting:**
- `components/ONCE/0.3.22.2/src/layer3/Certificate.interface.ts` (if needed)
- `components/ONCE/0.3.22.2/src/layer2/ServerHierarchyManager.ts` (cert storage)

**Tests:**
- `components/ONCE/0.3.22.2/test/CertificateOrchestrator.test.ts`
- `components/ONCE/0.3.22.2/test/integration/https.test.ts`

---

## **Testing Strategy**

### **Unit Tests:**
- [ ] CertificateOrchestrator.acquireCertificate() calls LetsEncrypt
- [ ] Fallback to self-signed on LetsEncrypt failure
- [ ] Certificate storage works correctly
- [ ] Domain validation logic

### **Integration Tests:**
- [ ] UI button triggers certificate acquisition
- [ ] Certificate status updates in UI
- [ ] HTTPS server uses acquired certificate

### **Manual Tests:**
- [ ] **Happy Path:** Click "Get Certificate" → LetsEncrypt cert acquired
- [ ] **Fallback:** Force LetsEncrypt failure → self-signed used
- [ ] **Renewal:** Click "Renew Certificate" → new cert acquired
- [ ] **Validation:** Browser shows valid HTTPS with cert
- [ ] **Expiry:** Certificate near expiry shows renewal button

---

## **Definition of Done**

- [ ] H.4: UI button implemented in OnceOverView
- [ ] H.5: CertificateOrchestrator wired with fallback
- [ ] LetsEncrypt integration functional
- [ ] Self-signed fallback works
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing verified (happy path + fallback)
- [ ] PDCA marked H.4-H.5 complete
- [ ] User guide updated
- [ ] Code reviewed and merged

---

## **Related Documents**

- [PDCA: HTTPS.PWA LetsEncrypt Integration](../../components/ONCE/0.3.21.8/session/2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md)
- [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)

---

## **Production Considerations**

### **LetsEncrypt Requirements:**
- Domain must be publicly accessible
- Port 80 must be open for HTTP-01 challenge
- Rate limits: 50 certificates per domain per week
- Email required for expiry notifications

### **Auto-Renewal:**
- Check certificate expiry daily
- Renew when <30 days remaining
- Store renewal timestamp to avoid rate limits

### **Error Handling:**
- Clear error messages for domain validation failures
- Fallback to self-signed ensures system always works
- Log all LetsEncrypt failures for troubleshooting

---

## **Success Celebration**

This task completes **production-ready HTTPS**:
- 🎯 Automated certificate management (LetsEncrypt)
- 🎯 Graceful fallback (self-signed)
- 🎯 User-friendly UI for certificate operations
- 🎯 HTTPS.PWA PDCA 100% complete!

---

**Created:** 2026-01-17
**Last Updated:** 2026-01-17
**Sprint:** [Sprint 30 Planning](./planning.md)
