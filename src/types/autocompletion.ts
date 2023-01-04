import type { DefaultTypedotsParams } from '.';
import type { AnyObject, ValueOf, Matcher, Join } from './generic';

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
  BaseObject[Property],
  AnyObject,
  PreventDistribution,
  Join<[
    Matcher<ParentProperty, string, PreventDistribution>,
    `${ExtractObjectSubpaths<
        BaseObject[Property],
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
  BaseObject[Property],
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
  BaseObject[Property],
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
  BaseObject[Property],
  AnyObject,
  PreventDistribution,
  ExtractObjectSubpaths<
    BaseObject[Property],
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
