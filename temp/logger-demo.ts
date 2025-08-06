#!/usr/bin/env tsx

import { logger, LogLevel } from './Logger';

// Demo script to showcase logger functionality
console.log('=== Logger Demo ===\n');

// Set context
logger.setContext('LoggerDemo');

// Demo different log levels
console.log('1. Standard Logging Methods:');
logger.log('This is a standard log message (white)');
logger.warn('This is a warning message (yellow)');
logger.error('This is an error message (red)');
logger.debug('This is a debug message (blue)');

console.log('\n2. State Machine Specific Logging (using logAction):');
logger.logAction('Status message (green)', 'status');
logger.logAction('Step message (blue)', 'step');
logger.logAction('Progression message (yellow)', 'progression');
logger.logAction('Testing message (gray)', 'testing');

console.log('\n3. Backward Compatibility (logAction):');
logger.logAction('Status action', 'status');
logger.logAction('Step action', 'step');
logger.logAction('Error action', 'error');
logger.logAction('Testing action', 'testing');

console.log('\n4. Log Level Filtering:');
logger.setLevel(LogLevel.ERROR);
console.log('Log level set to ERROR - only errors should show:');
logger.log('This should NOT show');
logger.warn('This should NOT show');
logger.error('This should show (red)');
logger.debug('This should NOT show');

logger.setLevel(LogLevel.TESTING);
console.log('\nLog level set to TESTING - all messages should show:');
logger.log('This should show (white)');
logger.warn('This should show (yellow)');
logger.error('This should show (red)');
logger.debug('This should show (blue)');
logger.logAction('This should show (gray)', 'testing');

console.log('\n=== Demo Complete ==='); 