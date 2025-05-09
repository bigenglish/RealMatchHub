
import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: './dist/server/index.js',
  external: ['express', '@google-cloud/*', 'firebase-admin'],
}).catch(() => process.exit(1));
