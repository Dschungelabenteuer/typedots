import typescriptPreset from '@yungezeit/eslint-typescript';

export default [...typescriptPreset, {
  rules: {
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  }
}];