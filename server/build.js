
const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

esbuild.build({
  entryPoints: ['./index.ts'],
  bundle: true,
  platform: 'node',
  outfile: '../dist/server/index.js',
  plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));
