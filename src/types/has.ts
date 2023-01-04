import type { DefaultTypedotsParams, ExtractObjectPaths, TypedotsParams } from '.';
import type { AnyObject, AnyOtherString } from './generic';

export type HasMethod<P extends TypedotsParams = DefaultTypedotsParams> = <
  BaseObject extends AnyObject,
  Path extends ExtractObjectPaths<BaseObject, P['expectedType'], P['preventDistribution']>
    | AnyOtherString,
>(object: BaseObject, path: Path) => boolean;
