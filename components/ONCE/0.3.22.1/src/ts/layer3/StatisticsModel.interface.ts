/**
 * StatisticsModel.interface.ts
 * 
 * DRY Statistics Interface
 * Shared statistics model for all components that track operations
 * 
 * @layer3
 * @pattern DRY - Don't Repeat Yourself
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 * 
 * Web4 Principle: Models are PURE DATA - no methods, no behavior!
 * Components operate on their own models directly.
 */

/**
 * Statistics Model
 * 
 * DRY interface for tracking operations across components
 * Used by: Loader, Route, Router, and any component with statistics
 * 
 * ✅ PURE DATA INTERFACE - No methods, no behavior
 * ✅ Components update their own model.statistics directly
 * ✅ Model is serializable JSON
 * 
 * Web4 Principle 8: DRY - Don't Repeat Yourself
 * Single source of truth for operation statistics
 */
export interface StatisticsModel {
    /**
     * Total number of operations performed
     * Includes both successful and failed operations
     */
    totalOperations: number;
    
    /**
     * Number of successful operations
     */
    successCount: number;
    
    /**
     * Number of failed operations
     */
    errorCount: number;
    
    /**
     * ISO timestamp of last operation (success or failure)
     */
    lastOperationAt: string;
    
    /**
     * ISO timestamp of last error
     * Empty string if no errors occurred yet
     */
    lastErrorAt: string;
    
    /**
     * ISO timestamp of statistics creation
     */
    createdAt: string;
    
    /**
     * ISO timestamp of last statistics update
     */
    updatedAt: string;
}


