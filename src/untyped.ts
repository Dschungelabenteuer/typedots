import { untypedSet, untypedGet, untypedHas } from './helpers';
import type { UntypedGetMethod } from './helpers/get';
import type { UntypedHasMethod } from './helpers/has';

export class Untypedots {
  get: UntypedGetMethod = (object, path) => untypedGet(object, path);

  set = untypedSet;

  has: UntypedHasMethod = (object, path) => untypedHas(object, path);
}

if (import.meta.vitest) {
  const { describe, it } = import.meta.vitest;
  describe('Untypedots: should not have "Type instantiation is excessively deep and possibly infinite', () => {
    it('get', () => {
      const untypedObject = {} as any;
      new Untypedots().get(untypedObject, 'any.path');
    });

    it('has', () => {
      const untypedObject = {} as any;
      new Untypedots().has(untypedObject, 'any.path');
    });

    it('set', () => {
      const untypedObject = {} as any;
      new Untypedots().set(untypedObject, 'any.path', 'anyValue');
    });
  });
}
