import type { BaseTypedots, TypedotsParams } from './types/base';
import { get, has, set } from './helpers';
import type { GetMethod } from './helpers/get';
import type { HasMethod } from './helpers/has';

export default class Typedots<P extends TypedotsParams> implements BaseTypedots<P> {
  get: GetMethod<P> = (object, path) => get(object, path);

  set = set;

  has: HasMethod<P> = (object, path) => has(object, path);
}
