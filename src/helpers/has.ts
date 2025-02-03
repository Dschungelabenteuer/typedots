import type { HasMethod } from '../types/has';
import { parMatchRegexp, pathSplitRegexp } from './common';

const helpers = {
  analyzeSubpath: (currentScope: Record<'value', any>, subpath: string) => {
    const parsedSubpath = subpath.replace(parMatchRegexp, '');
    const isScopeObject = currentScope.value && typeof currentScope.value === 'object';
    const hasNotSubpath = !isScopeObject
      || !Object.prototype.hasOwnProperty.call(currentScope.value, parsedSubpath);

    if (hasNotSubpath) return true;

    currentScope.value = currentScope.value[parsedSubpath];
    return false;
  },
};

export const has: HasMethod = (object, path) => {
  const currentScope: Record<'value', any> = { value: object };
  return !path
    .split(pathSplitRegexp)
    .some((subpath: string) => helpers.analyzeSubpath(currentScope, subpath));
};

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;
  const { baseObject, variableName } = await import('../mocks');
  describe('has', () => {
    it('should return true if it exists', () => {
      expect(has(baseObject, 'prop1')).toStrictEqual(true);
      expect(has(baseObject, 'prop3.subprop1')).toStrictEqual(true);
      expect(has(baseObject, 'prop3.subprop2')).toStrictEqual(true);
      expect(has(baseObject, 'prop3.subprop3.three')).toStrictEqual(true);
    });

    it('should return false if it does not exist', () => {
      // @ts-expect-error Strict mode should error the below line as the target path does not exist.
      expect(has(baseObject, 'it.does.not.exist')).toStrictEqual(false);
    });

    it('should work with dynamic properties', () => {
      const noTargetVariable = 'it.does.not.exist';
      expect(has(baseObject, variableName)).toEqual(true);
      // @ts-expect-error Strict mode should error the below line as the target path does not exist.
      expect(has(baseObject, noTargetVariable)).toEqual(false);
    });

    it('should work with properties containing dots', () => {
      expect(has(baseObject, '(prop.5).nested')).toStrictEqual(true);
      // @ts-expect-error Strict mode should error the below line as the target path does not exist.
      expect(has(baseObject, '(prop.not.existing).nested')).toStrictEqual(false);
    });

    it('should work with `undefined` target value', () => {
      expect(has(baseObject, 'prop3.subprop4')).toStrictEqual(true);
    });

    it('should stop looking as soon as a child property does not exist', () => {
      vi.spyOn(helpers, 'analyzeSubpath');
      // @ts-expect-error Strict mode should error the below line as the target path does not exist.
      has(baseObject, 'prop3.subprop3.three.not.existing.sub.path');
      expect(helpers.analyzeSubpath).toHaveBeenCalledTimes(4);
    });
  });
}
