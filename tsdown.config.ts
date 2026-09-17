import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  entry: ['./src/index.ts'],
  define: { 'import.meta.vitest': 'undefined' },
});
