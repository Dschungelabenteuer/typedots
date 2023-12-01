import type { DefaultTypedotsParams } from '.';
import type { AnyObject, ValueOf, Matcher, Join } from './generic';
import type { baseObject } from '../mocks';

export type AcceptNullable<T> = Exclude<T, null | undefined>;

export type FormatPath<Key> = Key extends `${string}.${string}`
  ? `(${Key})`
  : `${Key & string}`;

export type ExtractObjectSubpaths<
  BaseObject,
  ParentKey extends string,
  ExpectedType = DefaultTypedotsParams['expectedType'],
  PreventDistribution = DefaultTypedotsParams['preventDistribution'],
> = ValueOf<{
  [Key in keyof BaseObject as Matcher<Key, string, PreventDistribution>]:
    | ObjectPaths<BaseObject, Key, ParentKey, ExpectedType, PreventDistribution>
    | SimplePath<BaseObject, Key, ParentKey, ExpectedType, PreventDistribution>
}> & string;

export type ObjectPaths<
  BaseObject,
  Property extends keyof BaseObject,
  ParentProperty extends string,
  ExpectedType = DefaultTypedotsParams['expectedType'],
  PreventDistribution = DefaultTypedotsParams['preventDistribution'],
> = Matcher<
  AcceptNullable<BaseObject[Property]>,
  AnyObject,
  PreventDistribution,
  Join<[
    Matcher<ParentProperty, string, PreventDistribution>,
    `${ExtractObjectSubpaths<
        AcceptNullable<BaseObject[Property]>,
        Matcher<Property, string, PreventDistribution>,
        ExpectedType,
        PreventDistribution
    >}`,
  ]>
>;

export type SimplePath<
  BaseObject,
  Property extends keyof BaseObject,
  ParentProperty extends string,
  ExpectedType = DefaultTypedotsParams['expectedType'],
  PreventDistribution = DefaultTypedotsParams['preventDistribution'],
> = Matcher<
  AcceptNullable<BaseObject[Property]>,
  ExpectedType,
  PreventDistribution,
  Join<[
    `${FormatPath<ParentProperty>}`,
    `${FormatPath<Matcher<Property, string, PreventDistribution>>}`,
  ]>
>;

export type PropertyPath<
  BaseObject,
  Property extends keyof BaseObject,
  ExpectedType = DefaultTypedotsParams['expectedType'],
  PreventDistribution = DefaultTypedotsParams['preventDistribution'],
> = Matcher<
  AcceptNullable<BaseObject[Property]>,
  ExpectedType,
  PreventDistribution,
  Property
>;

export type SubpropertyPaths<
  BaseObject,
  Property extends keyof BaseObject,
  ExpectedType = DefaultTypedotsParams['expectedType'],
  PreventDistribution = DefaultTypedotsParams['preventDistribution'],
> = Matcher<
  AcceptNullable<BaseObject[Property]>,
  AnyObject,
  PreventDistribution,
  ExtractObjectSubpaths<
    AcceptNullable<BaseObject[Property]>,
    Matcher<Property, string, PreventDistribution>,
    ExpectedType,
    PreventDistribution
  >
>;

export type ExtractObjectPaths<
  BaseObject,
  ExpectedType = DefaultTypedotsParams['expectedType'],
  PreventDistribution = DefaultTypedotsParams['preventDistribution'],
> = ValueOf<{
  [Key in keyof BaseObject as Matcher<Key, string, PreventDistribution>]:
  | FormatPath<PropertyPath<BaseObject, Key, ExpectedType, PreventDistribution>>
  | SubpropertyPaths<BaseObject, Key, ExpectedType, PreventDistribution>
}> & string;

if (import.meta.vitest) {
  const { describe, it, assertType } = import.meta.vitest;

  describe('ExtractObjectPaths', () => {
    it('should return correct keys', () => {
      const paths = '' as ExtractObjectPaths<typeof baseObject>;
      assertType<'prop4' | 'prop1' | 'prop2' | 'prop3' | 'prop3.subprop1' | 'prop3.subprop2' | 'prop3.subprop3.one' | 'prop3.subprop3.two' | 'prop3.subprop3.three' | 'prop3.subprop3' | '(prop.5)' | '(prop.5).nested' | '(prop.5).(another.sub.prop)'>(paths);
    });

    it('should ignore strict null checks (root)', () => {
      const paths = '' as ExtractObjectPaths<{
        prop1?: string;
        prop2?: string | null;
        prop3?: string | undefined;
        prop4?: string | null | undefined;
        prop5: string | null;
        prop6: string | undefined;
        prop7: string | null | undefined;
      }>;
      assertType<'prop1' | 'prop2' | 'prop3' | 'prop4' | 'prop5' | 'prop6' | 'prop7'>(paths);
    });

    it('should ignore strict null checks (object property)', () => {
      const paths = '' as ExtractObjectPaths<{
        prop1?: { item: string };
        prop2?: { item: string } | null;
        prop3?: { item: string } | undefined;
        prop4?: { item: string } | null | undefined;
      }>;
      assertType<'prop1' | 'prop1.item' | 'prop2' | 'prop2.item' | 'prop3' | 'prop3.item' | 'prop4' | 'prop4.item' | 'prop5' | 'prop5.item' | 'prop6' | 'prop6.item' | 'prop7' | 'prop7.item'>(paths);
    });

    it('should ignore strict null checks (object property children)', () => {
      const paths = '' as ExtractObjectPaths<{
        parent: {
          prop1?: string;
          prop2?: string | null;
          prop3?: string | undefined;
          prop4?: string | null | undefined;
          prop5: string | null;
          prop6: string | undefined;
          prop7: string | null | undefined;
        }
      }>;
      assertType<'parent' | 'parent.prop1' | 'parent.prop2' | 'parent.prop3' | 'parent.prop4' | 'parent.prop5' | 'parent.prop6' | 'parent.prop7'>(paths);
    });

    it('should work with variable property names', () => {
      const variableName = 'prop2';
      const paths = '' as ExtractObjectPaths<{
        'prop1': string;
        [variableName]: string;
      }>;
      assertType<'prop1' | 'prop2'>(paths);
    });

    it('should wrap properties containing a dot', () => {
      const paths = '' as ExtractObjectPaths<{
        'prop.1': string;
        prop2: { 'prop2.child': string };
      }>;
      assertType<'(prop.1)' | 'prop2' | 'prop2.(prop2.child)'>(paths);
    });
  });
}
