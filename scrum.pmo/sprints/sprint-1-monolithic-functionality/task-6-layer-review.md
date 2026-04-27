[Back to Sprint 1 Planning](./planning.md)

# Layer Understanding Review — PUML Diagram Corrections Needed

## Problem Found

The 11 PUML diagrams label layers incorrectly. The labels I used don't match the original EAMD.ucp 5-layer architecture OR the UpDown project's layer usage.

## Original EAMD.ucp Layers (from directory structure)

| Layer | EAMD.ucp Content | Meaning |
|-------|------------------|---------|
| **L1** | Thinglish/Once kernel, OnceServices (EventService) | **Kernel & Infrastructure** — the ONCE runtime itself |
| **L2** | DefaultFile, DefaultFolder, User, Session, RESTClient, Web4Proxy | **Concrete implementations** — Default* classes that implement interfaces |
| **L3** | DomainEntity, Filter, Governance, Service, connectors, accounting, inventory | **Domain services & business logic** — EAM domain layer |
| **L4** | DOES NOT EXIST in original EAMD | — |
| **L5** | Card, Form, FileSystem, UserPanel, Workflow, css, html | **UX & Views** — Web Components, forms, visual elements |

## UpDown Project Layers (per Principle 7)

The UpDown project added Layer 4 for async orchestration:

| Layer | UpDown Content | Principle 7 Rule |
|-------|---------------|-----------------|
| **L1** | ONCE.ts kernel singleton, LoggingUtils, HostnameParser, NodeOSInfrastructure | **Infrastructure** — synchronous kernel |
| **L2** | Default* classes (UcpComponent, DefaultUnit, HTTPServer, etc.) | **Implementation** — synchronous business logic |
| **L3** | *.interface.ts, JsInterface, UcpModel, TypeDescriptor, enums | **Interfaces & contracts** — synchronous data structures |
| **L4** | IOR, FileLoader, IORMethodRouter, ProxyRoute, TSCompletion, CertificateOrchestrator | **Orchestration** — ONLY layer with async allowed |
| **L5** | ONCECLI, Web4TSComponentCLI, Lit views, css, html | **UX** — CLI and visual |

## What I Got Wrong in the Diagrams

### Error 1: Layer 3 labeling
I labeled L3 as "Interfaces" in all diagrams. But in the UpDown project, L3 contains not just `*.interface.ts` files — it also contains **runtime classes** like:
- `JsInterface.ts` — abstract class, not an interface file
- `UcpModel.ts` — full class with ISR proxy logic (hundreds of lines)
- `TypeDescriptor.ts` — class with methods, not a simple interface
- `Component.ts` — JsInterface runtime class (not `Component.interface.ts`)

**Correction:** L3 = "Interfaces & Runtime Type Classes" (contracts + JsInterface subclasses + model proxy)

### Error 2: Layer 1 too generic
I labeled L1 as "Infrastructure" generically. But L1 is specifically the **kernel singleton and OS-level primitives** — not all infrastructure:
- `ONCE.ts` — the kernel singleton (Once.isNode, etc.)
- `NodeOSInfrastructure.ts` — wraps Node.js `os` module
- `LoggingUtils.ts` — kernel-level logging
- `PlatformDetection.ts` — runtime detection

**Correction:** L1 = "Kernel & OS Infrastructure" (specifically kernel-level, not generic infrastructure)

### Error 3: Layer descriptions inconsistent across diagrams
Some diagrams say "Layer 2 — Implementation", others say "Layer 2 — Web4TSComponent (prod)". The layer meaning should be consistent.

## Diagrams Needing Correction

| Diagram | Current L1 Label | Current L3 Label | Needs Fix? |
|---------|-----------------|-----------------|------------|
| UCP-ClassDiagram | (none shown) | "Interfaces" | YES — L3 has JsInterface, UcpModel, TypeDescriptor (runtime classes) |
| Unit-ClassDiagram | (none shown) | "Interfaces" | YES — minor, mostly interfaces but still |
| Persistence-ClassDiagram | (none shown) | "Interfaces" | YES — same |
| User-ClassDiagram | "Infrastructure" | "Interfaces" | YES — L1 should say "Kernel & OS" |
| Filesystem-ClassDiagram | "Infrastructure" | "Interfaces" | YES — L1 is PlatformDetection |
| HTTP-ClassDiagram | (none shown) | "Interfaces" | YES — minor |
| TLS-ClassDiagram | (none shown) | "Interfaces" | YES — minor |
| W4TSC-IMC-ClassDiagram | (none shown) | "Interfaces" | YES — minor |
| W4TSC-FrameworkComponents | (none shown) | (none shown) | NO |
| Web4x-ComponentDependency | (none shown) | (none shown) | NO |
| UnitModel-Enhanced | (none shown) | (none shown) | NO |

## Proposed Sprint Task

### Task 6.8: Architect — Correct Layer Labels in All PUML Diagrams

**Priority:** 2 (HIGH — incorrect architecture documentation is worse than none)

**Steps:**
1. Update all L3 package labels from `"Layer 3 — Interfaces"` to `"Layer 3 — Interfaces & Runtime Types"`
2. Update L1 labels from `"Layer 1 — Infrastructure"` to `"Layer 1 — Kernel & OS Infrastructure"`
3. Add L4 annotation in diagrams that show L4: `"Layer 4 — Async Orchestration (P7: only async layer)"`
4. Re-render all 8 affected SVGs
5. Tester verifies all render without errors

**Effort:** Small — text label changes only, no structural changes to diagrams.

### Task 6.9: Architect — Create EAMD Layer Reference Diagram

**Priority:** 3 (MEDIUM — educational, for onboarding)

Create a single PUML diagram showing the 5-layer architecture with:
- Original EAMD.ucp meanings
- UpDown project additions (Layer 4)
- Principle 7 annotation (async only in L4)
- Example classes per layer

## Acceptance Criteria
- [ ] All 8 diagrams have corrected layer labels
- [ ] All SVGs re-rendered with zero errors
- [ ] EAMD layer reference diagram created
- [ ] PO reviews and confirms layer understanding is correct
