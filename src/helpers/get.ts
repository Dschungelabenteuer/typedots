import type { GetMethod } from '../types/get';
import { parMatchRegexp, pathSplitRegexp } from './common';

export const get: GetMethod = (object, path) => path
  .split(pathSplitRegexp).reduce(
    (parent, current) => parent?.[current.replace(parMatchRegexp, '')],
    object,
  );

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  const { baseObject, variableName } = await import('../mocks');
  describe('get', () => {
    it('should return correct value', () => {
      expect(get(baseObject, 'prop1')).toStrictEqual(true);
      expect(get(baseObject, 'prop3.subprop1')).toStrictEqual('string');
      expect(get(baseObject, 'prop3.subprop2')).toStrictEqual(expect.any(Array));
      expect(get(baseObject, 'prop3.subprop3.three')).toStrictEqual(false);
    });

    it('should work with dynamic properties', () => {
      expect(get(baseObject, variableName)).toEqual({});
    });

    it('should work with properties containing dots', () => {
      expect(get(baseObject, '(prop.5).nested')).toStrictEqual('string');
    });

    it('should return undefined if it does not exist', () => {
      expect(get(baseObject, 'it.does.not.exist')).toStrictEqual(undefined);
      expect(get(baseObject, 'prop3.subprop1.inexisting')).toStrictEqual(undefined);
    });
  });
}
