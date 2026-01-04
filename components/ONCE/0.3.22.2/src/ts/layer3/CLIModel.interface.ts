/**
 * CLIModel - Extends Model for CLI context
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import type { Model } from './Model.interface.js';

export interface CLIModel extends Model {
  // uuid, name inherited from Model
  
  // Path Authority - Project-level absolute paths
  projectRoot: string;
  componentsDir: string;
  scriptsDir: string;
  scriptsVersionDir: string;
  testDataDir: string;
  
  // Completion context - FLAT in model
  completionCliName: string;
  completionCompWords: string[];
  completionCompCword: number;
  
  // Derived completion state
  completionCurrentWord: string;
  completionPreviousWord: string;
  completionCommand: string | null;
  completionParameters: string[];
  completionParameterIndex: number;
  
  // Chaining context
  completionChainedCommands: string[];
  
  // Completion state flags
  completionIsCompletingMethod: boolean;
  completionIsCompletingParameter: boolean;
  
  // Completion output buffer
  completionOutputLines: string[];
}
