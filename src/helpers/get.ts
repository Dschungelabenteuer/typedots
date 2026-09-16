import type { DefaultTypedotsParams, TypedotsParams, ErrorHandler } from '../types';
import type { ExtractObjectPaths } from '../types';
import type { AnyObject } from '../types/generic';

import { Payload } from './common';
import { SourceNotAnObjectError, UndefinedPropertyError } from './errors';
import { parMatchRegexp, pathSplitRegexp, validatePath } from './common';

export type GetMethod<P extends TypedotsParams = DefaultTypedotsParams> = <
  BaseObject extends AnyObject,
  Path extends ExtractObjectPaths<BaseObject, P['expectedType'], P['preventDistribution']>,
>(
  object: BaseObject,
  path: Path,
  handleErrors?: ErrorHandler
) => undefined | any;

export const get: GetMethod = (object, path, handleErrors: ErrorHandler = false) =>
  path.split(pathSplitRegexp).reduce((source: any, current: any, index: number) => {
    const parsedSubpath = current.replace(parMatchRegexp, '');
    const payload = new Payload(path, index, source, parsedSubpath);
    if (handleErrors) validatePath(payload, handleErrors);
    return source?.[parsedSubpath];
  }, object);

type UntypedGetMethod = (object: Record<string, any>, path: string, throwErrors?: boolean) => any;
export const untypedGet = get as UntypedGetMethod;

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  const { baseObject, variableName } = await import('../tests/mocks');
  const { expectToThrow } = await import('../tests/expects');

  describe('get', () => {
    describe('with valid paths', () => {
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
    });

    describe('with invalid paths', () => {
      describe.each([
        {
          title: 'Using non-existent top-level property',
          path: 'it.does.not.exist',
          expectedError: UndefinedPropertyError,
          expectedErrorCurrentPath: '<root>',
          expectedErrorSubpath: 'it',
        },
        {
          title: 'Using a non-object property',
          path: 'prop3.subprop1.inexisting',
          expectedError: SourceNotAnObjectError,
          expectedErrorCurrentPath: 'prop3.subprop1',
          expectedErrorSubpath: 'inexisting',
        },
        {
          title: 'Using non-existent nested property in prop3.subprop3',
          path: 'prop3.subprop3.inexisting',
          expectedError: UndefinedPropertyError,
          expectedErrorCurrentPath: 'prop3.subprop3',
          expectedErrorSubpath: 'inexisting',
        },
        {
          title: 'Using a property that resolved to undefined',
          path: 'prop3.subprop4',
          expectedError: UndefinedPropertyError,
          expectedErrorCurrentPath: 'prop3.subprop4',
          expectedErrorSubpath: 'subprop4',
          errors: false,
        },
      ])(`$title`, (c) => {
        const { path, expectedError, expectedErrorCurrentPath, expectedErrorSubpath, errors } = c;
        it('should return undefined if handleErrors is disabled', () => {
          // @ts-expect-error Strict mode should error the below line as the target path does not exist.
          expect(get(baseObject, path)).toStrictEqual(undefined);
        });

        if (errors) {
          it('should raise error if handleErrors is enabled', () => {
            expectToThrow(
              // @ts-expect-error Strict mode should error the below line as the target path does not exist.
              () => get(baseObject, path, 'throw'),
              expectedError,
              expectedErrorCurrentPath,
              expectedErrorSubpath
            );
          });
        }
      });
    });
  });
}
