import type { ErrorHandler } from '../types';
import type { InvalidPathError } from './errors';
import { SourceNotAnObjectError, UndefinedPropertyError } from './errors';

export const pathSplitRegexp = /(?<!\(.*)\.|(?<=.*\))\./g;
export const parMatchRegexp = /[()]/g;

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const hasDefinedProperty = (object: Record<any, any>, key: string) =>
  Object.keys(object).includes(key);

export function handleError(error: InvalidPathError, handleErrors: ErrorHandler) {
  if (handleErrors === 'throw') throw error;
  console.warn(error.message);
}

export function validatePath(payload: Payload, handleErrors: Exclude<ErrorHandler, false>) {
  const _ = (error: InvalidPathError) => handleError(error, handleErrors);

  if (!isObject(payload.source)) {
    return _(new SourceNotAnObjectError(payload));
  }

  if (!hasDefinedProperty(payload.source, payload.subpath)) {
    return _(new UndefinedPropertyError(payload));
  }
}

export class Payload {
  constructor(
    public path: string,
    public index: number,
    public source: unknown,
    public subpath: string
  ) {}

  public get currentPath() {
    const res = this.path.split(pathSplitRegexp).slice(0, this.index).join('.');
    return res.length === 0 ? '<root>' : res;
  }
}
