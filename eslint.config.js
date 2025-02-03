import typescriptPreset from '@yungezeit/eslint-typescript';

export default [...typescriptPreset, {
  ignores: ['dist/**/*.*', '.rollup.cache/**/*.*', 'README.md'],
  rules: {
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  }
}];