// Run the named suites in one Node process while the Job Object workspace is isolated.
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('../../../', import.meta.url)));
await import('../../../src/ui/welcome/welcome.test.mjs');
await import('../../../src/ui/receipt-presentation.test.mjs');
