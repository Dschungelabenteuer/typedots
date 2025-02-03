import type { DefaultTypedotsParams } from '.';
import type { baseObject } from '../mocks';
import type { AcceptNullable, AnyObject, Join, Matcher } from './generic';

type ObjectPaths<
  T,
  ExpectedType,
  PreventDistribution extends boolean,
  Prefix extends string = ""
> = T extends never
  ? never
  : {
    [K in keyof T & string]: AcceptNullable<T[K]> extends AnyObject
        ?
          | Matcher<T[K], Join<Prefix, K>, ExpectedType, PreventDistribution>
          | ObjectPaths<AcceptNullable<T[K]>, ExpectedType, PreventDistribution, `${Join<Prefix, K>}.`>
        : Matcher<T[K], Join<Prefix, K>, ExpectedType, PreventDistribution>;
    }[keyof T & string];

export type ExtractObjectPaths<
  T,
  ExpectedType = DefaultTypedotsParams['expectedType'],
  PreventDistribution extends boolean = DefaultTypedotsParams['preventDistribution'],
> = ObjectPaths<T, ExpectedType, PreventDistribution>;

if (import.meta.vitest) {
  const { describe, it, assertType } = import.meta.vitest;

  describe('ExtractObjectPaths', () => {
    it('should return correct keys', () => {
      type TestedType = ExtractObjectPaths<typeof baseObject>;
      assertType<TestedType>('prop4');
      assertType<TestedType>('prop1');
      assertType<TestedType>('prop2');
      assertType<TestedType>('prop3');
      assertType<TestedType>('prop3.subprop1');
      assertType<TestedType>('prop3.subprop2');
      assertType<TestedType>('prop3.subprop3.one');
      assertType<TestedType>('prop3.subprop3.two');
      assertType<TestedType>('prop3.subprop3.three');
      assertType<TestedType>('prop3.subprop3');
      assertType<TestedType>('(prop.5)');
      assertType<TestedType>('(prop.5).nested');
      assertType<TestedType>('(prop.5).(another.sub.prop)');
    });

    it('should ignore strict null checks (root)', () => {
      type TestedType = ExtractObjectPaths<{
        prop1?: string;
        prop2?: string | null;
        prop3?: string | undefined;
        prop4?: string | null | undefined;
        prop5: string | null;
        prop6: string | undefined;
        prop7: string | null | undefined;
      }>;

      assertType<TestedType>('prop1');
      assertType<TestedType>('prop2');
      assertType<TestedType>('prop3');
      assertType<TestedType>('prop4');
      assertType<TestedType>('prop5');
      assertType<TestedType>('prop6');
      assertType<TestedType>('prop7');
    });

    it('should ignore strict null checks (object property)', () => {
      type TestedType = ExtractObjectPaths<{
        prop1?: { item: string };
        prop2?: { item: string } | null;
        prop3?: { item: string } | undefined;
        prop4?: { item: string } | null | undefined;
      }>;
      assertType<TestedType>('prop1');
      assertType<TestedType>('prop1.item');
      assertType<TestedType>('prop2');
      assertType<TestedType>('prop2.item');
      assertType<TestedType>('prop3');
      assertType<TestedType>('prop3.item');
      assertType<TestedType>('prop4');
      assertType<TestedType>('prop4.item');
    });

    it('should ignore strict null checks (object property children)', () => {
      type TestedType = ExtractObjectPaths<{
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

      assertType<TestedType>('parent');
      assertType<TestedType>('parent.prop1');
      assertType<TestedType>('parent.prop2');
      assertType<TestedType>('parent.prop3');
      assertType<TestedType>('parent.prop4');
      assertType<TestedType>('parent.prop5');
      assertType<TestedType>('parent.prop6');
      assertType<TestedType>('parent.prop7');
    });

    it('should work with variable property names', () => {
      const variableName = 'prop2';
      type TestedType = ExtractObjectPaths<{
        'prop1': string;
        [variableName]: string;
      }>;
      assertType<TestedType>('prop1');
      assertType<TestedType>('prop2');
    });

    it('should wrap properties containing a dot', () => {
      type TestedType = ExtractObjectPaths<{
        'prop.1': string;
        prop2: { 'prop2.child': string };
      }>;
      assertType<TestedType>('(prop.1)');
      assertType<TestedType>('prop2');
      assertType<TestedType>('prop2.(prop2.child)');
    });

    it('should handle `expectedType` correctly', () => {
      interface BaseTestedType {
        myProperty: "value of my property",
        myMethod: (message: string) => string,
        helpers: {
          maxLength: 255,
          count(item: unknown[]): number,
        },
      }
      type TestedFnType = ExtractObjectPaths<BaseTestedType, (args: any) => any>;
      type TestedStringType = ExtractObjectPaths<BaseTestedType, string>;
      type TestedNumberType = ExtractObjectPaths<BaseTestedType, number>;

      assertType<TestedFnType>('myMethod');
      assertType<TestedFnType>('helpers.count');
      assertType<TestedStringType>('myProperty');
      assertType<TestedNumberType>('helpers.maxLength');
    });

    it('should handle `preventDistribution` correctly', () => {
      interface BaseTestedType { one: false, two: true, three: boolean }

      type TestedTrueType = ExtractObjectPaths<BaseTestedType, true>;
      // This matches because of boolean distribution.
      assertType<TestedTrueType>('three');
      // This matches because it is explicitly `true`.
      assertType<TestedTrueType>('two');
      // @ts-expect-error This should not match!
      assertType<TestedTrueType>('one');


      type TestedUndistributedTrueType = ExtractObjectPaths<BaseTestedType, true, true>;
      // @ts-expect-error This should not match because boolean distribution is prevented!
      assertType<TestedUndistributedTrueType>('three');
      // This matches because it is explicitly `true`.
      assertType<TestedUndistributedTrueType>('two');
      // @ts-expect-error This should not match!
      assertType<TestedTrueDType>('one');


      type TestedFalseType = ExtractObjectPaths<BaseTestedType, false>;
       // This matches because of boolean distribution.
      assertType<TestedFalseType>('three');
      // This matches because it is explicitly `false`.
      assertType<TestedFalseType>('one');
      // @ts-expect-error This should not match!
      assertType<TestedFalseType>('two');

      type TestedUndistributedFalseType = ExtractObjectPaths<BaseTestedType, false, true>;
      // @ts-expect-error This should not match because boolean distribution is prevented!
     assertType<TestedUndistributedFalseType>('three');
     // This matches because it is explicitly `false`.
     assertType<TestedUndistributedFalseType>('one');
     // @ts-expect-error This should not match!
     assertType<TestedUndistributedFalseType>('two');
    });
  });
}
