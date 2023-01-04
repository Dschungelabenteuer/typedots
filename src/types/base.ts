import type { GetMethod } from './get';
import type { SetMethod } from './set';
import type { HasMethod } from './has';

export type TypedotsParams = {
  expectedType?: any;
  strictMode?: boolean;
  preventDistribution?: boolean;
};

export type DefaultTypedotsParams = TypedotsParams & {
  expectedType: any;
  strictMode: false;
  preventDistribution: false;
};

export class BaseTypedots<P extends TypedotsParams> {
  get: GetMethod<P>;

  set: SetMethod<P>;

  has: HasMethod<P>;
}
