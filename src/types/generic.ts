import type { DefaultTypedotsParams } from '.';

export type ValueOf<T> = T[keyof T];

export type AnyObject = { [k: string]: unknown };

export type AnyOtherString = string & Record<never, never>;

export type Join<
  Strings extends string[],
  Separator extends string = '.',
  Start = true,
> = Strings extends [infer Current, ...infer Rest]
  ? Current extends string
    ? Rest extends string[]
      ? Start extends true
        ? `${Current}${Join<Rest, Separator, false>}`
        : `${Separator}${Current}${Join<Rest, Separator, Start>}`
      : never
    : never
  : '';

export type Matcher<
  Type,
  ExpectedType,
  PreventDistribution = DefaultTypedotsParams['preventDistribution'],
  ReturnType = Type & ExpectedType,
> = PreventDistribution extends true
    ? [Type] extends [ExpectedType]
      ? ReturnType
      : never
    : Type extends ExpectedType
      ? ReturnType
      : never;
