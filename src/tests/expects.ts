import { expect } from 'vitest';
import type { InvalidPathError } from '../helpers/errors';

export const expectToThrow = (
  fn: () => unknown,
  ErrorClass: typeof InvalidPathError,
  currentPath: string,
  subpath: string
) => {
  try {
    fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    expect(error).toBeInstanceOf(ErrorClass);
    console.log('>>>', error.message);

    const { payload } = error as InvalidPathError;
    expect({ currentPath: payload.currentPath, subpath: payload.subpath }).toStrictEqual(
      expect.objectContaining({ currentPath, subpath })
    );
  }
};
