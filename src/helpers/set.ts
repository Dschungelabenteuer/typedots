import type { ErrorHandler, ExtractObjectPaths } from '../types';
import type { AddProp, AnyObject, Prettify } from '../types/generic';

import {
  handleError,
  hasDefinedProperty,
  isObject,
  parMatchRegexp,
  pathSplitRegexp,
} from './common';
import { SourceNotAnObjectError, UndefinedPropertyError } from './errors';

export type UpdateApplied = boolean;

const helpers = {
  getSubpaths: <Parent extends Parameters<typeof set>[0], Path extends Parameters<typeof set>[1]>(
    object: Parent,
    path: Path
  ): { current: keyof typeof object; nested: string[] } => {
    const [current, ...nested] = path
      .split(pathSplitRegexp)
      .map((subpath: string) => subpath.replace(parMatchRegexp, ''));
    return { current, nested };
  },

  updateDeep: <
    Parent extends Record<string, any>,
    Path extends keyof Parent & string,
    Rest extends string[],
    Value,
  >(
    parent: Parent,
    path: Path,
    rest: Rest,
    value: Value & any,
    force = false,
    handleErrors?: ErrorHandler
  ): UpdateApplied => {
    const nestedProp = rest.shift();
    if (!isObject(parent) && handleErrors)
      handleError(new SourceNotAnObjectError(payload), handleErrors);

    const hasPathProperty = hasDefinedProperty(parent, path);
    if (!hasPathProperty && nestedProp && handleErrors)
      handleError(new UndefinedPropertyError(payload), handleErrors);

    const hasPathObject = hasPathProperty && typeof parent[path] === 'object';
    if (!hasPathObject && nestedProp && handleErrors)
      handleError(new SourceNotAnObjectError(payload), handleErrors);

    const hasPathObjectSubPath =
      nestedProp && hasPathObject && hasDefinedProperty(parent[path], nestedProp);

    if (!nestedProp && (hasPathProperty || force)) {
      parent[path] = value;
      return true;
    }

    if (!nestedProp) return false;

    if (!rest.length) {
      if (hasPathObjectSubPath) {
        parent[path] = { ...parent[path], [nestedProp]: value };
        return true;
      }

      if (!hasPathObjectSubPath && force) {
        parent[path] = { [nestedProp]: value } as any;
        return true;
      }

      return false;
    }

    if (!hasPathObject && force) {
      parent[path] = {} as any;
    }

    return helpers.updateDeep(parent[path], nestedProp, rest, value, force);
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
    handleError(new SourceNotAnObjectError(payload), handleErrors);
    return false;
  }

  if (!hasDefinedProperty(object, current) && handleErrors) {
    handleError(new UndefinedPropertyError(payload), handleErrors);
    return false;
  }

  // pass directly object[current] instead
  return helpers.updateDeep(object, current, nested, value, force, handleErrors);
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
  const { get } = await import('./get');
  const { has } = await import('./has');

  describe('set', () => {
    let newValue: unknown;
    let objectCopy: typeof baseObject;
    beforeEach(() => {
      newValue = undefined;
      objectCopy = { ...baseObject };
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

      it('should update if digging existing non-object root property when `force = true`', () => {
        newValue = 'plop';
        if (set(objectCopy, 'prop1.edited', newValue as string, true)) {
          // objectCopy.prop1.edited = 'plop2';
          // @ts-expect-error investigate better type transform even though this case isn't recommended.
          expect(get(objectCopy, 'prop1.edited')).toStrictEqual(newValue);
        }
      });
    });

    describe('deeply nested property', () => {
      it('should update existing deeply nested property', () => {
        newValue = 'editedString';
        const updated = set(objectCopy, 'prop3.subprop3.three', newValue as string);
        expect(updated).toStrictEqual(true);
        expect(get(objectCopy, 'prop3.subprop3.three')).toStrictEqual(newValue);
      });

      it('should not create non-existing nested property when `force = false`', () => {
        newValue = 'newValue';
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        const updated = set(objectCopy, 'prop3.subprop3.nonexistant', newValue as string);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop3.subprop3.nonexistant')).toStrictEqual(undefined);
      });

      it('should create non-existing nested property when `force = true`', () => {
        newValue = 'newValue';
        if (set(objectCopy, 'prop3.subprop3.nonexistant', newValue as string, true)) {
          expect(get(objectCopy, 'prop3.subprop3.nonexistant')).toStrictEqual(newValue);
        }
      });

      it('should not update if digging existing non-object parent property when `force = false`', () => {
        newValue = false;
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        const updated = set(objectCopy, 'prop3.subprop3.three.nested', newValue as boolean);
        expect(updated).toStrictEqual(false);
        // @ts-expect-error Strict mode should error the below line as the target path does not exist.
        expect(get(objectCopy, 'prop3.subprop3.three.nested')).toStrictEqual(undefined);
      });

      it('should not update if digging existing non-object parent property when `force = true`', () => {
        newValue = false;
        if (set(objectCopy, 'prop3.subprop3.three.nested', newValue as boolean, true)) {
          // objectCopy.prop3.subprop3.three.nested = true;
          // @ts-expect-error investigate better type transform even though this case isn't recommended.
          expect(get(objectCopy, 'prop3.subprop3.three.nested')).toStrictEqual(newValue);
        }
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
  });
}

// @todo resolve
// @todo Always raise error when handleErrors, apart from when creating new nested properties ON A PATH THAT IS AN OBJECT with `force = true`
// if path is not an object, it should error
