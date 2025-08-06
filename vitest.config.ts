import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude src directory and legacy test files until we create the first task to change this behavior
    exclude: [
      'src/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.mocha.test.js',
      '**/*.mocha.test.ts',
      '**/Web4*/**',
      '**/Once*/**',
      '**/tssh*/**'
    ],
    // Only include our new unit tests
    include: [
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.test.js'
    ],
    environment: 'node',
    globals: true
  }
}); 