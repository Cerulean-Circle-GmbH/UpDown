#!/usr/bin/env node

/**
 * Build script for bundling TypeScript client code with esbuild
 * Bundles Lit web components and all dependencies into dist/
 */

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: [join(__dirname, 'src/public/ts/main.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2020',
  outfile: join(__dirname, 'src/public/dist/main.js'),
  sourcemap: true,
  minify: !isWatch,
  splitting: false,
  external: [],
  loader: {
    '.ts': 'ts'
  },
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
      useDefineForClassFields: false,
    }
  },
  logLevel: 'info',
};

async function build() {
  try {
    if (isWatch) {
      console.log('👀 Watching for changes...');
      const context = await esbuild.context(config);
      await context.watch();
    } else {
      console.log('📦 Building TypeScript with esbuild...');
      await esbuild.build(config);
      console.log('✅ Build complete!');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();

