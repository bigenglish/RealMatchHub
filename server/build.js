
import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: './dist/server/index.js',
  external: ['express', '@google-cloud/*', 'firebase-admin', 'react', 'react-dom'],
  loader: { '.ts': 'ts', '.tsx': 'tsx' },
  sourcemap: true,
  minify: true
}).catch(() => process.exit(1));
