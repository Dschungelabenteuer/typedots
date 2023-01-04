import type { RollupOptions } from 'rollup';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const getBuildOptions = (name: string): RollupOptions => ({
  output: [
    { file: `dist/${name}.cjs`, format: 'cjs' },
    { file: `dist/${name}.mjs`, format: 'module' },
  ],
  plugins: [
    typescript(),
    replace({
      'import.meta.vitest': 'undefined',
      preventAssignment: true,
    }),
  ],
});

const getDtsOptions = () => ({
  output: { file: 'dist/index.d.ts' },
  plugins: [dts()],
});

const config: RollupOptions[] = [
  { input: 'src/index.ts', ...getBuildOptions('index') },
  { input: 'src/index.ts', ...getDtsOptions() },
];

export default config;
