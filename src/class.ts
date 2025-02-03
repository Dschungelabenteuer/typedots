import type { BaseTypedots, TypedotsParams } from './types/base';
import type { GetMethod } from './types/get';
import type { HasMethod } from './types/has';
import { get, has, set } from './helpers';

export default class Typedots<P extends TypedotsParams> implements BaseTypedots<P> {
  get: GetMethod<P> = (object, path) => get(object, path);

  set = set;

  has: HasMethod<P> = (object, path) => has(object, path);
}
