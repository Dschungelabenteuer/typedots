import type { GetMethod } from '../helpers/get';
import type { HasMethod } from '../helpers/has';
import type { set } from '../helpers';

export interface TypedotsParams {
  expectedType?: any;
  preventDistribution: boolean;
}

export interface DefaultTypedotsParams extends TypedotsParams {
  expectedType: any;
  preventDistribution: false;
}

export type ErrorHandler = false | 'warn' | 'throw';

export interface Payload {
  path: string;
  index: number;
  source: unknown;
  subpath: string;
}

export interface BaseTypedots<P extends TypedotsParams> {
  get: GetMethod<P>;

  set: typeof set;

  has: HasMethod<P>;
}
