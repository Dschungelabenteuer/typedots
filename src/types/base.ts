import type { GetMethod } from './get';
import type { HasMethod } from './has';
import type { set } from '../helpers';

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

  set: typeof set;

  has: HasMethod<P>;
}
