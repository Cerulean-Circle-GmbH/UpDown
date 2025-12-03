/**
 * Controller.interface.ts - Web4 MVC Controller Interface
 * 
 * Controllers manage views and handle model updates.
 * 
 * Web4 Principles:
 * - P7: Layer 4 async, Layer 2/5 sync
 * - P16: TypeScript accessors
 * - P19: One file, one type
 * 
 * @ior ior:esm:/ONCE/{version}/Controller
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { View } from './View.interface.js';

/**
 * Web4 Controller Interface
 * 
 * Controllers manage the relationship between models and views.
 * They receive scenario updates and notify views to update.
 * 
 * Layer 2 (synchronous) - called from Layer 4 (async WebSocket)
 */
export interface Controller<TModel = any> {
  
  /**
   * Get the proxied model
   */
  get model(): TModel;
  
  /**
   * Register a view for model updates
   * View's model will be set to the proxied model
   * @param view View to register
   */
  viewRegister(view: View<TModel>): void;
  
  /**
   * Unregister a view
   * @param view View to unregister
   */
  viewUnregister(view: View<TModel>): void;
  
  /**
   * Update all registered views - SYNCHRONOUS!
   * Called when model changes, triggers view.update() on all views.
   * 
   * Web4 Principle 7: Layer 5 interactions are synchronous
   */
  viewsUpdateAll(): void;
  
  /**
   * Receive scenario from WebSocket (entry point from Layer 4)
   * Updates model which triggers synchronous view updates.
   * @param scenario Incoming scenario from WebSocket
   */
  scenarioReceive(scenario: any): void;
}

