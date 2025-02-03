import type { ExtractObjectPaths } from '../types';
import type { AddProp, AnyObject } from '../types/generic';
import type { SetMethod, UpdateApplied } from '../types/set';
import { parMatchRegexp, pathSplitRegexp } from './common';

const helpers = {
  getSubpaths: <
    Parent extends Parameters<SetMethod>[0],
    Path extends Parameters<SetMethod>[1],
  >(object: Parent, path: Path): {
    current: keyof typeof object;
    nested: string[];
  } => {
    const [current, ...nested] = path.split(pathSplitRegexp)
      .map((subpath: string) => subpath.replace(parMatchRegexp, ''));
    return { current, nested };
  },

  updateDeep: <
    Parent extends Record<string, any>,
    Path extends keyof Parent,
    Rest extends string[],
    Value,
  >(parent: Parent, path: Path, rest: Rest, value: Value & any, force = false): UpdateApplied => {
    const nestedProp = rest.shift();
    const hasPathProperty = Object.prototype.hasOwnProperty.call(parent, path);
    const hasPathObject = hasPathProperty && typeof parent[path] === 'object';
    const hasPathObjectSubPath = hasPathObject
      && Object.prototype.hasOwnProperty.call(parent[path], nestedProp);

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

    return helpers.updateDeep(
      parent[path],
      nestedProp,
      rest,
      value,
      force,
    );
  },
};

export const set = <
  BaseObject extends AnyObject,
  Path extends Force extends true
    ? ExtractObjectPaths<BaseObject, any, true> | string
    : ExtractObjectPaths<BaseObject, any, true>,
  Value,
  Force extends boolean = false,
  >(
    object: BaseObject,
    path:  Path,
    value: Value,
    force?: Force
): object is Force extends true
  ? Prettify<AddProp<BaseObject, Path, typeof value>>
  : BaseObject => {
  const { current, nested } = helpers.getSubpaths(object, path);
  return helpers.updateDeep(object, current, nested, value, force);
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};


if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest;
  const { baseObject, variableName } = await import('../mocks');
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
        };
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
        };
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
        };
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
        if(set(objectCopy, 'prop3.subprop3.nonexistant', newValue as string, true)) {
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
