import type { DefaultTypedotsParams, ExtractObjectPaths, TypedotsParams } from '.';
import type { AnyObject } from './generic';

export type UpdateApplied = boolean;

export type SetMethod<P extends TypedotsParams = DefaultTypedotsParams> = <
  BaseObject extends AnyObject,
  Path extends ExtractObjectPaths<BaseObject, P['expectedType'], P['preventDistribution']>,
  Value,
  Force extends boolean = false,
>(object: BaseObject, path: [Force] extends [true] ? Path | string : Path, value: Value & any, force?: Force) => UpdateApplied;
