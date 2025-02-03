import type { DefaultTypedotsParams, ExtractObjectPaths, TypedotsParams } from '.';
import type { AnyObject } from './generic';

export type GetMethod<P extends TypedotsParams = DefaultTypedotsParams> = <
  BaseObject extends AnyObject,
  Path extends ExtractObjectPaths<BaseObject, P['expectedType'], P['preventDistribution']>,
>(object: BaseObject, path: Path) => undefined | any;
