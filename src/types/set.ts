import type { DefaultTypedotsParams, ExtractObjectPaths, TypedotsParams } from '.';
import type { AnyObject, AnyOtherString } from './generic';

export type UpdateApplied = boolean;

export type SetMethod<P extends TypedotsParams = DefaultTypedotsParams> = <
  BaseObject extends AnyObject,
  Path extends ExtractObjectPaths<BaseObject, P['expectedType'], P['preventDistribution']>
    | AnyOtherString,
  Value,
  Force extends boolean = true,
>(object: BaseObject, path: Path, value: Value & any, force?: Force) => UpdateApplied;
