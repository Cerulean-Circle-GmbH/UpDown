[Back to Planning Sprint 30](./planning.md)

# Task 7: HTTPS.PWA H.4-H.5 LetsEncrypt Integration
[task:uuid:HTTPS-0007-2026-0118-PWA-COMPLETION]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-7.1-developer-ui-button.md`)
- Subtasks must always indicate the affected role in the filename.
- Subtasks must be ordered to avoid blocking dependencies.

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Traceability
- Source: HTTPS.PWA LetsEncrypt Integration - Production-Ready Certificate Management
- **Up:**
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
  - [HTTPS.PWA LetsEncrypt Integration PDCA](../../components/ONCE/0.3.21.8/session/2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md)
- **Down:**
  - [ ] [Task 7.1: Developer - UI Button Implementation (H.4)](./task-7.1-developer-ui-button.md)
  - [ ] [Task 7.2: Developer - CertificateOrchestrator Integration (H.5)](./task-7.2-developer-orchestrator-integration.md)
  - [ ] [Task 7.3: QA - Manual Certificate Testing](./task-7.3-qa-manual-testing.md)

---

## **What** (WODA)
Complete HTTPS.PWA by implementing LetsEncrypt UI button (H.4) and wiring CertificateOrchestrator with fallback logic (H.5), achieving production-ready automated certificate management with self-signed fallback.

## **Overview** (WODA)
- **Priority:** 3 (Medium - User-Facing Feature)
- **Estimated Time:** 2.5 hours
- **Current State:** H.1-H.3 complete (self-signed certs, HTTP→HTTPS redirect, HTTPS default)
- **Target State:** H.4-H.5 complete (LetsEncrypt UI, fallback logic, production-ready)
- **Progress:** HTTPS.PWA 60% → 100% after completion

## Context
HTTPS.PWA implementation has established self-signed certificate generation (H.1), HTTP→HTTPS redirection (H.2), and HTTPS-by-default configuration (H.3). To reach production readiness, the remaining work focuses on user-facing certificate management: a UI button for acquiring/renewing LetsEncrypt certificates with graceful fallback to self-signed certificates when LetsEncrypt fails. This establishes the pattern for production certificate lifecycle management.

## Intention
Create Web4 compliant HTTPS certificate management using Radical OOP patterns. Enable users to acquire production-grade certificates through the UI while maintaining system reliability through fallback mechanisms. Establish the reference pattern for production HTTPS deployment with automated renewal capabilities.

---

## **Details** (WODA)

### Files to Modify:
| File | Purpose | Changes Required |
|------|---------|------------------|
| `layer5/views/OnceOverView.ts` | Certificate UI display and button | Add certificate status section, Get/Renew button |
| `layer4/CertificateOrchestrator.ts` | Orchestrate certificate acquisition | Wire LetsEncrypt with fallback chain |
| `layer3/Certificate.interface.ts` | Certificate metadata contract | Define certificate shape if needed |
| `layer2/ServerHierarchyManager.ts` | Certificate storage/retrieval | Persist certificate in scenario |

### Technical Specifications (Complete Code)

**Certificate Status Display (H.4):**
```typescript
// File: components/ONCE/0.3.22.2/src/layer5/views/OnceOverView.ts
renderCertificateStatus() {
  const cert = this.model.certificate;
  if (!cert) {
    return html`
      <div class="cert-status-none">
        <span class="status-icon">🔓</span>
        <span class="status-text">No certificate installed</span>
      </div>
    `;
  }

  const daysUntilExpiry = this.daysUntilExpiry(cert);
  const statusClass = daysUntilExpiry < 30 ? 'expiring' : 'valid';

  return html`
    <div class="cert-status ${statusClass}">
      <span class="status-icon">🔒</span>
      <span class="cert-type">${cert.issuer === 'LetsEncrypt' ? "Let's Encrypt" : 'Self-Signed'}</span>
      <span class="expires">Expires: ${cert.expiryDate}</span>
      <span class="days-remaining">${daysUntilExpiry} days</span>
    </div>
  `;
}

renderCertificateActions() {
  const cert = this.model.certificate;
  const daysUntilExpiry = cert ? this.daysUntilExpiry(cert) : 0;
  const shouldRenew = !cert || daysUntilExpiry < 30;

  if (shouldRenew) {
    return html`
      <button @click=${this.acquireCertificate} ?disabled=${this.loading}>
        ${this.loading ? 'Acquiring...' : (cert ? 'Renew Certificate' : 'Get Certificate')}
      </button>
    `;
  }
  return html`<span class="cert-valid">Certificate valid</span>`;
}

async acquireCertificate() {
  this.loading = true;
  try {
    const cert = await IOR.call(
      'CertificateOrchestrator',
      'acquireCertificate'
    );
    this.model.certificate = cert;
    this.showSuccess(`Certificate ${cert.issuer === 'LetsEncrypt' ? 'acquired' : 'renewed'}`);
  } catch (error) {
    this.showError(`Certificate acquisition failed: ${error.message}`);
  } finally {
    this.loading = false;
  }
}
```

**CertificateOrchestrator Fallback Logic (H.5):**
```typescript
// File: components/ONCE/0.3.22.2/src/layer4/CertificateOrchestrator.ts
async acquireCertificate(): Promise<Certificate> {
  // Tier 1: Try LetsEncrypt
  try {
    return await this.acquireLetsEncrypt();
  } catch (letsEncryptError) {
    this.logWarn('LetsEncrypt acquisition failed', {
      error: letsEncryptError.message,
      domain: this.model.domain,
      timestamp: new Date().toISOString()
    });

    // Tier 2: Fallback to self-signed
    try {
      return await this.generateSelfSigned();
    } catch (fallbackError) {
      this.logError('Both LetsEncrypt and self-signed failed', fallbackError);
      throw new CertificateError(
        'Certificate acquisition failed (LetsEncrypt and self-signed)',
        { letsEncryptError, fallbackError }
      );
    }
  }
}

async acquireLetsEncrypt(): Promise<Certificate> {
  // Validate domain accessibility
  await this.validateDomain(this.model.domain);

  // Use ACME client for LetsEncrypt
  const certData = await this.acmeClient.getCertificate({
    domain: this.model.domain,
    email: this.model.email,
    challengeType: 'http-01'
  });

  const cert = await this.storeCertificate({
    issuer: 'LetsEncrypt',
    domain: this.model.domain,
    cert: certData.cert,
    key: certData.key,
    chain: certData.chain,
    expiryDate: new Date(certData.expiresAt),
    renewalUrl: certData.renewalUrl
  });

  return cert;
}

async generateSelfSigned(): Promise<Certificate> {
  const certData = await this.selfSignedGenerator.generate({
    domain: this.model.domain,
    validDays: 365
  });

  const cert = await this.storeCertificate({
    issuer: 'Self-Signed',
    domain: this.model.domain,
    cert: certData.cert,
    key: certData.key,
    expiryDate: new Date(certData.expiresAt)
  });

  return cert;
}

async storeCertificate(certData: CertificateData): Promise<Certificate> {
  const certificate: Certificate = {
    uuid: generateUUID(),
    issuer: certData.issuer,
    domain: certData.domain,
    expiryDate: certData.expiryDate,
    createdAt: new Date()
  };

  // Store in scenario model
  this.model.certificate = certificate;
  await this.serverHierarchyManager.saveCertificate(certificate, certData);

  return certificate;
}

async validateDomain(domain: string): Promise<void> {
  // Verify domain is publicly accessible and port 80 open
  try {
    const response = await fetch(`http://${domain}/.well-known/acme-challenge/test`);
    if (response.status !== 404 && response.status !== 500) {
      throw new Error('Domain not accessible for ACME challenge');
    }
  } catch (error) {
    throw new DomainValidationError(
      `Domain ${domain} not accessible for ACME validation`,
      error
    );
  }
}
```

---

## **Actions** (WODA)

### 1. UI Certificate Status and Button (H.4)
- [ ] Add certificate status display to OnceOverView.ts (shows issuer, expiry, days remaining)
- [ ] Implement "Get Certificate" button when no certificate exists
- [ ] Implement "Renew Certificate" button when certificate exists and <30 days remaining
- [ ] Add progress indicator during certificate acquisition
- [ ] Display success/failure messages after acquisition
- [ ] Calculate and display days until expiry
- [ ] Style certificate status section per design guidelines

### 2. CertificateOrchestrator Integration with Fallback (H.5)
- [ ] Implement `acquireCertificate()` method with tier-1 LetsEncrypt try
- [ ] Implement `acquireLetsEncrypt()` with ACME client integration
- [ ] Implement `generateSelfSigned()` fallback (tier-2)
- [ ] Wire domain validation before LetsEncrypt attempt
- [ ] Store acquired certificate in ServerHierarchyManager
- [ ] Log LetsEncrypt failures with context for debugging
- [ ] Handle certificate metadata (issuer, expiry, renewal URL)
- [ ] Implement `validateDomain()` for ACME challenge verification

### 3. Auto-Renewal Logic
- [ ] Add daily certificate expiry check
- [ ] Trigger renewal when <30 days remaining
- [ ] Prevent multiple simultaneous renewal attempts (debounce)
- [ ] Store renewal timestamp to respect LetsEncrypt rate limits

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_HTTPSPWA_H4H5_LetsEncrypt.ts
const req = this.requirement('HTTPS.PWA H.4-H.5', 'Production-ready certificate management');
req.addCriterion('AC-01', 'Certificate status displays in OnceOverView with issuer and expiry');
req.addCriterion('AC-02', '"Get Certificate" button triggers certificate acquisition');
req.addCriterion('AC-03', 'LetsEncrypt acquisition with fallback to self-signed on failure');
req.addCriterion('AC-04', 'Certificate renewal when <30 days remaining');
req.addCriterion('AC-05', 'Domain validation before LetsEncrypt attempt');
```

- [ ] **AC-01:** Certificate status displays in OnceOverView with issuer and expiry date
- [ ] **AC-02:** "Get Certificate" button visible and triggers `CertificateOrchestrator.acquireCertificate()`
- [ ] **AC-03:** LetsEncrypt acquisition succeeds and stores certificate in ServerHierarchyManager
- [ ] **AC-04:** Self-signed fallback triggered on LetsEncrypt failure
- [ ] **AC-05:** Domain validation prevents invalid LetsEncrypt attempts
- [ ] **AC-06:** Certificate renewal button appears when <30 days remaining
- [ ] **AC-07:** Progress indicator displays during acquisition
- [ ] **AC-08:** Success message shown after successful acquisition
- [ ] **AC-09:** Failure message with actionable error shown on acquisition failure
- [ ] **AC-10:** Unit tests passing (90%+ coverage)
- [ ] **AC-11:** Integration tests passing (UI → certificate acquisition → HTTPS)
- [ ] **AC-12:** Manual test: successful LetsEncrypt acquisition and verification
- [ ] **AC-13:** Manual test: LetsEncrypt failure triggers self-signed fallback

---

## Dependencies

### Prerequisites:
- ✅ H.1: Self-signed certificate generator complete
- ✅ H.2: HTTP→HTTPS redirect (42000→42777) functional
- ✅ H.3: All servers HTTPS by default
- ✅ ServerHierarchyManager exists with certificate storage capability
- ✅ IOR communication system working for UI→Orchestrator calls

### Blocks:
- 🔵 Production HTTPS deployment (depends on completion)
- 🔵 Certificate auto-renewal cycle (depends on completion)

---

## Definition of Done

- [ ] H.4: Certificate status displays in OnceOverView with Get/Renew buttons
- [ ] H.5: CertificateOrchestrator wired with LetsEncrypt→self-signed fallback chain
- [ ] LetsEncrypt integration functional with domain validation
- [ ] Self-signed fallback generates certificate on LetsEncrypt failure
- [ ] Certificate auto-renewal logic implemented (daily check, <30 days trigger)
- [ ] Unit tests passing (90%+ coverage)
- [ ] Integration tests passing (UI → Orchestrator → HTTPS)
- [ ] Manual testing verified (happy path + fallback scenario)
- [ ] PDCA entry marked H.4-H.5 complete
- [ ] User guide updated with certificate management instructions
- [ ] Error troubleshooting guide created
- [ ] Code reviewed and merged to dev/claudeFlow.v1

---

## QA Audit & User Feedback

### TRON Requirements - HTTPS.PWA Certificate Management
```quote
Complete production-ready HTTPS with LetsEncrypt UI button and CertificateOrchestrator fallback logic.
```

- **Issue:** Users need way to acquire production certificates without technical expertise
- **Resolution:** UI button with LetsEncrypt integration and graceful self-signed fallback
- **Pattern:** Radical OOP with Certificate metadata in scenario model, CertificateOrchestrator coordination

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (certificate metadata in scenario model)
- [ ] **P6:** Empty Constructor + init(scenario)
- [ ] **P18:** Method Chaining (acquireCertificate returns this)
- [ ] **P25:** Tootsie Tests Only (Web4Requirement based acceptance criteria)
- [ ] **P34:** IOR as Unified Entry Point (UI calls CertificateOrchestrator via IOR)

---

## Related Documents

- [PDCA: HTTPS.PWA LetsEncrypt Integration](../../components/ONCE/0.3.21.8/session/2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md)
- [PDCA: Iteration Tracking](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - HTTPS.PWA H.4-H.5 LetsEncrypt Integration*
*Priority: Medium - User-Facing Feature (2.5 hours)*
*Pattern: Radical OOP with Certificate Lifecycle Management and Fallback Resilience*
