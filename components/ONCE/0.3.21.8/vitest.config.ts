import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    exclude: [
      'test/data/**',
      'test/logs/**', 
      '**/node_modules/**',
      // Exclude deprecated white-box tests
      'test/**/*.deprecated.test.ts',
      'test/**/*.whitebox.test.ts.deprecated'
    ],
    testTimeout: 180000,   // 180s per test (3 minutes) - standardized timeout
    hookTimeout: 180000,   // 180s for setup/teardown (increased from 30s to handle slow tests)
    teardownTimeout: 30000, // 30s for cleanup
    // CRITICAL: Run tests sequentially to prevent race conditions
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: false  // Reduce IPC overhead that causes "onTaskUpdate" timeout
      }
    },
    // Run tests in sequence, not parallel
    fileParallelism: false,
    maxConcurrency: 1,
    // Multi-reporter: console + JSON for structured output
    reporters: ['default', 'json'],
    outputFile: './test/test-results.json'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});