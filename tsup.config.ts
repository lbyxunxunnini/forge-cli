import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  dts: true,
  splitting: false,
  bundle: true,
  platform: 'node',
  external: ['readline'],
  noExternal: [
    'react',
    'react-dom',
    'ink',
    'ink-text-input',
    'react-reconciler',
    'scheduler',
    'yoga-layout',
    'signal-exit',
    'ws',
  ],
  loader: {
    '.tsx': 'tsx',
  },
  banner: {
    js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.jsxImportSource = 'react';
    // react-devtools-core 是 ink 的可选调试依赖，Node.js 环境不需要
    options.alias = {
      'react-devtools-core': 'data:text/javascript,export default {}',
    };
  },
});
