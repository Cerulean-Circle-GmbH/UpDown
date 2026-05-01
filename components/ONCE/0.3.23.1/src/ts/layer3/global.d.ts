/**
 * Global Type Declarations for Web4 ONCE
 * Provides global.ONCE singleton in all environments
 * @layer3
 * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
 */

import type { ONCE } from './ONCE.interface.js';

declare global {
    /**
     * Global namespace available in all environments
     * - Browser: window.global.ONCE
     * - Node.js: global.ONCE
     * - Workers/PWA: self.global.ONCE
     */
    namespace NodeJS {
        interface Global {
            ONCE?: ONCE;
        }
    }

    interface Window {
        global?: {
            ONCE?: ONCE;
        };
    }

    interface WorkerGlobalScope {
        global?: {
            ONCE?: ONCE;
        };
    }

    // Make global accessible in Node.js
    var global: NodeJS.Global & typeof globalThis;
}

export {};





