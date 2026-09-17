import type { ErrorHandler, ExtractObjectPaths } from '../types';
import type { AddProp, AnyObject, Prettify } from '../types/generic';

import {
  handleError,
  hasDefinedProperty,
  isObject,
  parMatchRegexp,
  pathSplitRegexp,
  Payload,
} from './common';
import { SourceNotAnObjectError, UndefinedPropertyError } from './errors';

export type UpdateApplied = boolean;

const helpers = {
  getSubpaths: <Parent extends Parameters<typeof set>[0], Path extends Parameters<typeof set>[1]>(
    object: Parent,
    path: Path
  ): { current: keyof typeof object & string; nested: string[] } => {
    const [current, ...nested] = path
      .split(pathSplitRegexp)
      .map((subpath: string) => subpath.replace(parMatchRegexp, ''));
    return { current, nested };
  },

  updateDeep: <Source extends Record<string, any>, Subpaths extends string[], Value>(
    source: Source,
    subpaths: Subpaths,
    value: Value & any,
    force = false,
    handleErrors: ErrorHandler = false,
    fullPath: string,
    index = 0
  ): UpdateApplied => {
    const [current, ...rest] = subpaths;
    if (!current) return false;

    const payload = new Payload(fullPath, index, source, current);

    if (!isObject(source)) {
      if (handleErrors) handleError(new SourceNotAnObjectError(payload), handleErrors);
      return false;
    }

    const hasCurrent = hasDefinedProperty(source, current);
    const hasNested = rest.length > 0;

    if (!hasNested) {
      if (!hasCurrent && !force) {
        if (handleErrors) handleError(new UndefinedPropertyError(payload), handleErrors);
        return false;
      }

      (source as any)[current] = value;
      return true;
    }

    if (!hasCurrent) {
      if (!force) {
        if (handleErrors) handleError(new UndefinedPropertyError(payload), handleErrors);
        return false;
      }

      (source as any)[current] = {} as Record<string, any>;
    }

    if (!isObject(source[current])) {
      if (handleErrors) {
        const nestedPayload = new Payload(fullPath, index + 1, source[current], rest[0] ?? current);
        handleError(new SourceNotAnObjectError(nestedPayload), handleErrors);
      }
      return false;
    }

    return helpers.updateDeep(
      source[current],
      rest as string[],
      value,
      force,
      handleErrors,
      fullPath,
      index + 1
    );
  },
};

export const set = <
  BaseObject extends AnyObject,
  Path extends (Force extends true
    ? ExtractObjectPaths<BaseObject, any, true> | string
    : ExtractObjectPaths<BaseObject, any, true>),
  Value,
  Force extends boolean = false,
>(
  object: BaseObject,
  path: Path,
  value: Value,
  force?: Force,
  handleErrors?: ErrorHandler
): object is Force extends true
  ? Prettify<AddProp<BaseObject, Path, typeof value>>
  : BaseObject => {
  const { current, nested } = helpers.getSubpaths(object, path);
  if (!isObject(object) && handleErrors) {
    const payload = new Payload(path, 0, object, current);
    handleError(new SourceNotAnObjectError(payload), handleErrors);
    return false;
  }

  if (!hasDefinedProperty(object, current) && handleErrors && !force) {
    const payload = new Payload(path, 0, object, current);
    handleError(new UndefinedPropertyError(payload), handleErrors);
    return false;
  }

  return helpers.updateDeep(object, [current, ...nested], value, force, handleErrors, path);
};

export type UntypedSetMethod = (
  object: Record<string, any>,
  path: string,
  value: any,
  force?: boolean,
  throwErrors?: boolean
) => boolean;

export const untypedSet = set as UntypedSetMethod;

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest;
  const { baseObject, variableName } = await import('../tests/mocks');
  const { expectToThrow } = await import('../tests/expects');
  const { get } = await import('./get');
  const { has } = await import('./has');

  describe('set', () => {
    let newValue: unknown;
    let objectCopy: typeof baseObject;
    beforeEach(() => {
      newValue = undefined;
      objectCopy = structuredClone(baseObject);
    });

    describe('root property', () => {
      it('should update existing root property', () => {
        newValue = false;
        const updated = set(objectCopy, 'prop1', newValue);
        expect(updated).toStrictEqual(true);
        expect(get(objectCopy, 'prop1')).toStrictEqual(newValue);
      });

      it('should not create non-existing root property when `force = false`', () => {
        newValue = false;
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        const updated = set(objectCopy, 'nonexistant', newValue as boolean);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'nonexistant')).toStrictEqual(undefined);
      });

      it('should create non-existing root property when `force = true`', () => {
        newValue = false;
        if (set(objectCopy, 'anothernonexistant', newValue as boolean, true)) {
          expect(get(objectCopy, 'anothernonexistant')).toStrictEqual(newValue);
        }
      });
    });

    describe('nested property', () => {
      it('should update existing nested property', () => {
        newValue = 'editedString';
        const updated = set(objectCopy, 'prop3.subprop1', newValue as string);
        expect(updated).toStrictEqual(true);
        expect(get(objectCopy, 'prop3.subprop1')).toStrictEqual(newValue);
      });

      it('should not create non-existing nested property when `force = false`', () => {
        newValue = 'newValue';
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        const updated = set(objectCopy, 'prop3.nonexistant', newValue);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop3.nonexistant')).toStrictEqual(undefined);
      });

      it('should create non-existing nested property when `force = true`', () => {
        newValue = 'newValue';
        if (set(objectCopy, 'prop3.nonexistant', newValue, true)) {
          expect(get(objectCopy, 'prop3.nonexistant')).toStrictEqual(newValue);
        }
      });

      it('should not update if digging existing non-object root property when `force = false`', () => {
        newValue = false;
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        const updated = set(objectCopy, 'prop1.edited', newValue);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop1.edited')).toStrictEqual(undefined);
      });

      it('should not update if digging existing non-object root property when `force = true`', () => {
        newValue = 'plop';
        const updated = set(objectCopy, 'prop1.edited', newValue, true);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop1.edited')).toStrictEqual(undefined);
      });
    });

    describe('deeply nested property', () => {
      it('should update existing deeply nested property', () => {
        newValue = 'editedString';
        const updated = set(objectCopy, 'prop3.subprop3.three', newValue);
        expect(updated).toStrictEqual(true);
        expect(get(objectCopy, 'prop3.subprop3.three')).toStrictEqual(newValue);
      });

      it('should not create non-existing nested property when `force = false`', () => {
        newValue = 'newValue';
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        const updated = set(objectCopy, 'prop3.subprop3.nonexistant', newValue);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop3.subprop3.nonexistant')).toStrictEqual(undefined);
      });

      it('should create non-existing nested property when `force = true`', () => {
        newValue = 'newValue';
        if (set(objectCopy, 'prop3.subprop3.nonexistant', newValue, true)) {
          expect(get(objectCopy, 'prop3.subprop3.nonexistant')).toStrictEqual(newValue);
        }
      });

      it('should not update if digging existing non-object parent property when `force = false`', () => {
        newValue = false;
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        const updated = set(objectCopy, 'prop3.subprop3.three.nested', newValue);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop3.subprop3.three.nested')).toStrictEqual(undefined);
      });

      it('should not update if digging existing non-object parent property when `force = true`', () => {
        newValue = false;
        const updated = set(objectCopy, 'prop3.subprop3.three.nested', newValue, true);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop3.subprop3.three.nested')).toStrictEqual(undefined);
      });
    });

    describe('undefined values', () => {
      it('should work when explicitly setting target as undefined', () => {
        newValue = undefined;
        const updated = set(objectCopy, '(prop.5).nested', newValue as undefined);
        expect(updated).toStrictEqual(true);
        expect(has(objectCopy, '(prop.5).nested')).toStrictEqual(true);
        expect(get(objectCopy, '(prop.5).nested')).toStrictEqual(newValue);
      });
    });

    describe('dynamic properties', () => {
      it('should work with dynamic properties', () => {
        newValue = 'updatedDotValue';
        const updated = set(objectCopy, variableName, newValue as string);
        expect(updated).toStrictEqual(true);
        expect(get(objectCopy, variableName)).toStrictEqual(newValue);
      });
    });

    describe('with properties containing dots', () => {
      it('should work with existing properties containing dots', () => {
        newValue = 'updatedDotValue';
        const updated = set(objectCopy, '(prop.5).nested', newValue as string);
        expect(updated).toStrictEqual(true);
        expect(get(objectCopy, '(prop.5).nested')).toStrictEqual(newValue);
      });

      it('should work with existing properties containing dots', () => {
        newValue = 'updatedDotValue';
        if (set(objectCopy, '(prop.5).(nested.with.name)', newValue as string, true)) {
          expect(get(objectCopy, '(prop.5).(nested.with.name)')).toStrictEqual(newValue);
          expect(objectCopy['prop.5']).toHaveProperty('nested.with.name');
        }
      });
    });

    describe('error handling', () => {
      it('should not throw when creating non-existing root property and `force = true`', () => {
        newValue = 'newValue';

        expect(() => set(objectCopy, 'nonexistant', newValue, true, 'throw')).not.toThrow();
        if (set(objectCopy, 'nonexistant', newValue, true, 'throw')) {
          expect(objectCopy.nonexistant).toStrictEqual(newValue);
        }
      });

      it('should not throw when creating along non-existing root property and `force = true`', () => {
        newValue = 'newValue';

        expect(() =>
          set(objectCopy, 'nonexistant.nonexistantsubprop', newValue, true, 'throw')
        ).not.toThrow();
        if (set(objectCopy, 'nonexistant.nonexistantsubprop', newValue, true, 'throw')) {
          expect(objectCopy.nonexistant.nonexistantsubprop).toStrictEqual(newValue);
        }
      });

      it('should not throw when traversing non-existing nested property and `force = false`', () => {
        newValue = 'newValue';
        expectToThrow(
          // @ts-expect-error Strict mode should error the below line as the target path does not exist.
          () => set(objectCopy, 'prop3.nonexistant', newValue, false, 'throw'),
          UndefinedPropertyError,
          'prop3',
          'nonexistant'
        );
      });

      it('should throw when traversing non-object path even with `force = true`', () => {
        newValue = 'newValue';
        expectToThrow(
          () => set(objectCopy, 'prop1.edited', newValue, true, 'throw'),
          SourceNotAnObjectError,
          'prop1',
          'edited'
        );
      });

      it('should not throw when creating nested property on object path with `force = true`', () => {
        newValue = 'newValue';
        expect(() => set(objectCopy, 'prop3.nonexistant', newValue, true, 'throw')).not.toThrow();
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop3.nonexistant')).toStrictEqual(newValue);
      });
    });
  });

  describe('untyped', () => {
    it('should not have "Type instantiation is excessively deep and possibly infinite."', () => {
      const untypedObject = {} as any;
      untypedSet(untypedObject, 'any.path', 'anyValue');
    });
  });
}
