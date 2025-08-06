// CLI entry point for GitScrumProject in strict OOP/ESM style
import { OOSH } from './OOSH.ts';

// Parse positional arguments: oosh <command> [params...]
const [,, command, ...params] = process.argv;

if (!command || command === 'help') {
  OOSH.help();
  process.exit(0);
}

if (typeof (OOSH as any)[command] === 'function') {
  (OOSH as any)[command](...params);
} else {
  console.error(`Unknown command: ${command}`);
  OOSH.help();
  process.exit(1);
}
