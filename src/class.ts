import type { BaseTypedots, TypedotsParams } from './types/base';
import type { GetMethod } from './types/get';
import type { SetMethod } from './types/set';
import type { HasMethod } from './types/has';
import { get, set, has } from './helpers';

export default class Typedots<P extends TypedotsParams> implements BaseTypedots<P> {
  get: GetMethod<P> = (object, path) => get(object, path);

  set: SetMethod<P> = (object, path, value, force) => set(object, path, value, force);

  has: HasMethod<P> = (object, path) => has(object, path);
}
