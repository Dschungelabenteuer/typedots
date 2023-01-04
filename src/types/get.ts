import type { DefaultTypedotsParams, ExtractObjectPaths, TypedotsParams } from '.';
import type { AnyObject, AnyOtherString } from './generic';

export type GetMethod<P extends TypedotsParams = DefaultTypedotsParams> = <
  BaseObject extends AnyObject,
  Path extends ExtractObjectPaths<BaseObject, P['expectedType'], P['preventDistribution']>
    | (P['strictMode'] extends false ? AnyOtherString : never),
>(object: BaseObject, path: Path) => undefined | any;
