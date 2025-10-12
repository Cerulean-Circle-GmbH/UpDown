import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/public/ts/main.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2020',
  outfile: 'src/public/dist/main.js',
  sourcemap: true,
  minify: !isWatch,
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
      useDefineForClassFields: false,
    }
  },
};

if (isWatch) {
  const context = await esbuild.context(config);
  await context.watch();
  console.log('👀 Watching for changes...');
} else {
  await esbuild.build(config);
  console.log('✅ Build complete!');
}
