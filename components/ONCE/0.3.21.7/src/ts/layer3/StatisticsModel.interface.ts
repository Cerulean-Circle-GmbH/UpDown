/**
 * StatisticsModel.interface.ts
 * 
 * DRY Statistics Interface
 * Shared statistics model for all components that track operations
 * 
 * @layer3
 * @pattern DRY - Don't Repeat Yourself
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

/**
 * Statistics Model
 * 
 * DRY interface for tracking operations across components
 * Used by: Loader, Route, Router, and any component with statistics
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

/**
 * Create initial statistics
 * 
 * @returns Fresh StatisticsModel with zero counts
 */
export function createStatistics(): StatisticsModel {
    const now = new Date().toISOString();
    return {
        totalOperations: 0,
        successCount: 0,
        errorCount: 0,
        lastOperationAt: '',
        lastErrorAt: '',
        createdAt: now,
        updatedAt: now
    };
}

/**
 * Record successful operation
 * 
 * @param stats - Statistics model to update
 * @returns Updated statistics (mutates input)
 */
export function recordSuccess(stats: StatisticsModel): StatisticsModel {
    const now = new Date().toISOString();
    stats.totalOperations++;
    stats.successCount++;
    stats.lastOperationAt = now;
    stats.updatedAt = now;
    return stats;
}

/**
 * Record failed operation
 * 
 * @param stats - Statistics model to update
 * @returns Updated statistics (mutates input)
 */
export function recordError(stats: StatisticsModel): StatisticsModel {
    const now = new Date().toISOString();
    stats.totalOperations++;
    stats.errorCount++;
    stats.lastOperationAt = now;
    stats.lastErrorAt = now;
    stats.updatedAt = now;
    return stats;
}

