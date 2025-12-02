import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test isolation
    isolate: true,
    
    // Timeouts
    testTimeout: 30000,
    hookTimeout: 10000,
    
    // Reporter
    reporters: ['verbose'],
    
    // Coverage (optional)
    coverage: {
      enabled: false,
      provider: 'c8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
    },
    
    // Include test files
    include: [
      'test/lifecycle-management/**/*.test.ts',
      'test/lifecycle-management/**/*.spec.ts'
    ],
    
    // Globals
    globals: true
  },
  
  // Resolve configuration
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
});
