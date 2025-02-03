import type { GetMethod } from './get';
import type { SetMethod } from './set';
import type { HasMethod } from './has';

export interface TypedotsParams {
  expectedType?: any;
  preventDistribution: boolean;
}

export type DefaultTypedotsParams = TypedotsParams & {
  expectedType: any;
  preventDistribution: false;
};

export class BaseTypedots<P extends TypedotsParams> {
  get: GetMethod<P>;

  set: SetMethod<P>;

  has: HasMethod<P>;
}
