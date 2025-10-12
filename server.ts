// Simple development server for the game
import { file, serve } from 'bun';
import { join } from 'path';

const PORT = 3000;

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let filepath = url.pathname;

    // Default to index.html
    if (filepath === '/') {
      filepath = '/index.html';
    }

    // Serve from public directory for HTML/CSS
    if (filepath.endsWith('.html') || filepath.endsWith('.css')) {
      const publicPath = join(process.cwd(), 'public', filepath);
      const publicFile = file(publicPath);
      if (await publicFile.exists()) {
        return new Response(publicFile);
      }
    }

    // Serve JS files from dist (compiled TypeScript)
    if (filepath.endsWith('.js')) {
      // Try dist first (compiled)
      const distPath = join(process.cwd(), 'dist', filepath.replace('/src/', ''));
      const distFile = file(distPath);
      if (await distFile.exists()) {
        return new Response(distFile, {
          headers: { 'Content-Type': 'application/javascript' }
        });
      }

      // Fallback to src (for direct serving during dev)
      const srcPath = join(process.cwd(), filepath);
      const srcFile = file(srcPath);
      if (await srcFile.exists()) {
        return new Response(srcFile, {
          headers: { 'Content-Type': 'application/javascript' }
        });
      }
    }

    // 404 for everything else
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🎴 UpDown game server running at http://localhost:${PORT}`);
console.log(`Open your browser to start playing!`);

