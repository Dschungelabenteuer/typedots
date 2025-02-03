export type PathParams<T, Rest> = { first: T, rest: Rest };
export type AnyObject = Record<string, unknown>;
export type AcceptNullable<T> = Exclude<T, null | undefined>;

export type SanitizeKey<Key, DoSanitize extends boolean> = DoSanitize extends true
 ? Key extends `${string}.${string}` ? `(${Key})` : Key & string
 : Key

export type Join<
  Prefix extends string = '',
  Key extends string = '',
  DoSanitize extends boolean = true
> = `${Prefix}${SanitizeKey<Key, DoSanitize>}`;

export type Matcher<
  Type,
  KeyPath extends string,
  ExpectedType,
  PreventDistribution extends boolean,
> = PreventDistribution extends true
    ? [Type] extends [ExpectedType]
      ? KeyPath
      : never
    : Type extends ExpectedType
      ? KeyPath
      : never;


/**
 * @example ```ts
 *  type Input = { one: { subone: { subonetwo: string; } } };
 *
 *  type OutputOne = AddProp<Input, 'one.subone.subonethree', number>;
 *  declare const outputOne: OutputOne;
 *  outputOne.one.subone.subonethree = 5;
 *
 *  type OutputTwo = AddProp<Input, 'two', string>;
 *  declare const outputTwo: OutputTwo;
 *  outputTwo.two = 'str';
 * ```
 */
export type AddProp<
  T extends AnyObject,
  Path extends string,
  TargetType,
  Params extends PathParams<any, any> = Split<Path>
> = T & Record<
    Params['first'],
    Params['rest'] extends undefined
      ? TargetType
      : T[Params['first']] extends AnyObject
        ? Params['rest'] extends `(${infer A})`
          ? T[Params['first']] & Record<A, TargetType>
          : AddProp<T[Params['first']], Params['rest'], TargetType>
        : Record<Params['rest'], TargetType>
    >;

export type Split<T extends string> = (
  T extends `(${infer A}).${infer Rest}`
  ? PathParams<A, Rest>
  : T extends `${infer A}.${infer Rest}`
    ? PathParams<A, Rest>
    : PathParams<T, undefined>
);
