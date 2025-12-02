#!/usr/bin/env node
/**
 * Test Renumbering via Radical OOP
 * Each test renames ITSELF - no functional utilities!
 */

// Import all test classes
import { Test01_PathAuthorityAndProjectRootDetection } from './Test01_PathAuthorityAndProjectRootDetection.js';
import { Test02_ComponentDescriptorValidation } from './Test02_ComponentDescriptorValidation.js';
import { Test03_EnvironmentDetectionAndConfiguration } from './Test03_EnvironmentDetectionAndConfiguration.js';
import { Test04_CLICommandAvailabilityAndHelp } from './Test04_CLICommandAvailabilityAndHelp.js';
import { Test05_ServerStartAndBootstrap } from './Test05_ServerStartAndBootstrap.js';
import { Test06_DemoMessageBroadcast } from './Test06_DemoMessageBroadcast.js';
import { Test07_ComponentLoadingAndImport } from './Test07_ComponentLoadingAndImport.js';
import { Test08_ScenarioHibernationAndPersistence } from './Test08_ScenarioHibernationAndPersistence.js';
import { Test09_MultiPeerMessageExchange } from './Test09_MultiPeerMessageExchange.js';
import { Test10_ServerShutdownAndCleanup } from './Test10_ServerShutdownAndCleanup.js';
import { Test11_ScenarioUUIDUniquenessAndPersistence } from './Test11_ScenarioUUIDUniquenessAndPersistence.js';
import { Test12_ScenarioTimestampAccuracyAndOrdering } from './Test12_ScenarioTimestampAccuracyAndOrdering.js';
import { Test13_ConcurrentMessageHandlingAndRaceConditions } from './Test13_ConcurrentMessageHandlingAndRaceConditions.js';
import { Test14_ErrorHandlingAndRecovery } from './Test14_ErrorHandlingAndRecovery.js';
import { Test15_CompleteLifecycleIntegrationFullCircle } from './Test15_CompleteLifecycleIntegrationFullCircle.js';

console.log('🔄 Renumbering ONCE Lifecycle Tests (Radical OOP Style)');
console.log('   Each test renames ITSELF!\n');

// Mapping: old test instance -> new number
// Tests rename themselves in the correct logical order
const renumberMap = [
  { test: new Test01_PathAuthorityAndProjectRootDetection(), newNum: 1 },  // Already correct!
  { test: new Test02_ComponentDescriptorValidation(), newNum: 2 },         // Already correct!
  { test: new Test03_EnvironmentDetectionAndConfiguration(), newNum: 3 },  // Already correct!
  { test: new Test04_CLICommandAvailabilityAndHelp(), newNum: 4 },         // Already correct!
  { test: new Test05_ServerStartAndBootstrap(), newNum: 5 },               // Already correct!
  { test: new Test06_DemoMessageBroadcast(), newNum: 6 },                  // Already correct!
  { test: new Test07_ComponentLoadingAndImport(), newNum: 7 },             // Already correct!
  { test: new Test08_ScenarioHibernationAndPersistence(), newNum: 8 },     // Already correct!
  { test: new Test09_MultiPeerMessageExchange(), newNum: 9 },              // Already correct!
  { test: new Test10_ServerShutdownAndCleanup(), newNum: 10 },             // Already correct!
  { test: new Test11_ScenarioUUIDUniquenessAndPersistence(), newNum: 11 }, // Already correct!
  { test: new Test12_ScenarioTimestampAccuracyAndOrdering(), newNum: 12 }, // Already correct!
  { test: new Test13_ConcurrentMessageHandlingAndRaceConditions(), newNum: 13 }, // Already correct!
  { test: new Test14_ErrorHandlingAndRecovery(), newNum: 14 },             // Already correct!
  { test: new Test15_CompleteLifecycleIntegrationFullCircle(), newNum: 15 } // Already correct!
];

// Each test renames itself (Radical OOP!)
console.log('Asking each test to renumber itself...\n');
for (const { test, newNum } of renumberMap) {
  try {
    test.renumber(newNum);
  } catch (error) {
    console.error(`❌ Test renumber failed:`, error);
  }
}

console.log('\n✨ All tests have renamed themselves!');
console.log('\n📋 Final Logical Order:');
console.log('  01: Path Authority (FOUNDATION)');
console.log('  02: Component Descriptor');
console.log('  03: Environment Detection');
console.log('  04: CLI Help');
console.log('  05: Server Start');
console.log('  06: Demo Message');
console.log('  07: Component Loading');
console.log('  08: Scenario Hibernation');
console.log('  09: Multi-Peer');
console.log('  10: Server Shutdown');
console.log('  11: UUID Persistence');
console.log('  12: Timestamp Accuracy');
console.log('  13: Concurrent Handling');
console.log('  14: Error Handling');
console.log('  15: Complete Integration');

