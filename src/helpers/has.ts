import { expectToThrow } from '../tests/expects';
import type { InvalidPathError } from './errors';
import type { DefaultTypedotsParams, TypedotsParams } from '../types';
import type { ErrorHandler, ExtractObjectPaths } from '../types';
import type { AnyObject } from '../types/generic';
import { handleError } from './common';
import { UndefinedPropertyError } from './errors';

import { get } from './get';

export type HasMethod<P extends TypedotsParams = DefaultTypedotsParams> = <
  BaseObject extends AnyObject,
  Path extends ExtractObjectPaths<BaseObject, P['expectedType'], P['preventDistribution']>,
>(
  object: BaseObject,
  path: Path,
  handleErrors?: ErrorHandler
) => boolean;

export const has: HasMethod = (object, path, handleErrors = false) => {
  try {
    get(object, path, 'throw');
  } catch (e) {
    if (handleErrors) handleError(e as InvalidPathError, handleErrors);
    return false;
  }

  return true;
};

export type UntypedHasMethod = (
  object: Record<string, any>,
  path: string,
  handleErrors?: ErrorHandler
) => boolean;

export const untypedHas = has as UntypedHasMethod;

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  const { baseObject, variableName } = await import('../tests/mocks');

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
      // @ts-expect-error Strict mode should error the below line as the target path does not exist.
      expect(has(baseObject, 'prop3.subprop3.three.not.existing.sub.path')).toStrictEqual(false);
    });

    it('should throw an error if throwErrors is true and the path does not exist', () => {
      expectToThrow(
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        () => has(baseObject, 'it.does.not.exist', 'throw'),
        UndefinedPropertyError,
        '<root>',
        'it'
      );
    });

    it('should throw an error if throwErrors is true and a non-existing nested path is accessed', () => {
      expectToThrow(
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        () => has(baseObject, 'prop3.subprop3.inexisting', 'throw'),
        UndefinedPropertyError,
        'prop3.subprop3',
        'inexisting'
      );
    });

    it('should return true when using a property that resolves to undefined', () => {
      expect(has(baseObject, 'prop3.subprop4')).not.toThrow(true);
      expect(has(baseObject, 'prop3.subprop4')).toStrictEqual(true);
    });
  });
}
