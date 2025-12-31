/**
 * ViewRegistry.ts - Polymorphic View Registration for ISR Pattern
 * 
 * Registers Web4 component types with their corresponding views.
 * This enables UcpView.tagFor() to return the correct custom element
 * tag for polymorphic rendering.
 * 
 * Import this module early to ensure registrations are complete
 * before views render.
 * 
 * Web4 Principles:
 * - P4: Radical OOP
 * - P34: IOR as Unified Entry Point
 * 
 * @ior ior:esm:/ONCE/{version}/ViewRegistry
 * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
 */

import { UcpView } from './UcpView.js';

// Import component classes for registration
// Using dynamic imports to avoid circular dependencies
let registrationComplete = false;

/**
 * Register all component → view mappings
 * 
 * Called automatically on module load, but can be called
 * explicitly to ensure registration before rendering.
 */
export function registerViews(): void {
  if (registrationComplete) return;
  
  // Lazy import to avoid circular dependencies
  // These are the Layer 2 implementation classes
  
  // DefaultFile → file-item-view
  import('../../layer2/DefaultFile.js').then(function onFileLoaded(module) {
    UcpView.viewRegister(module.DefaultFile, 'file-item-view');
  }).catch(function onFileError(err) {
    console.warn('[ViewRegistry] Could not register DefaultFile:', err.message);
  });
  
  // DefaultFolder → folder-item-view
  import('../../layer2/DefaultFolder.js').then(function onFolderLoaded(module) {
    UcpView.viewRegister(module.DefaultFolder, 'folder-item-view');
  }).catch(function onFolderError(err) {
    console.warn('[ViewRegistry] Could not register DefaultFolder:', err.message);
  });
  
  // DefaultImage → image-default-view (if available)
  import('../../layer2/DefaultImage.js').then(function onImageLoaded(module) {
    UcpView.viewRegister(module.DefaultImage, 'image-default-view');
  }).catch(function onImageError() {
    // Image component may not be loaded in all contexts
  });
  
  registrationComplete = true;
  console.log('[ViewRegistry] Component → View registrations initiated');
}

// Auto-register on module load
registerViews();

