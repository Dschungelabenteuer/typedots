<h1 align="center">typedots</h1>

<p align="center">
  A simple way to get and set object properties using paths (aka dot notation).
  <br />
  Features advanced TypeScript capabilities for better Developer Experience.
  <img src="https://user-images.githubusercontent.com/16818271/210556353-b4aa4c6c-590b-4d3f-9bbf-396bbf6df194.png" alt="Image illustrating suggestions based on base object" />
</p>

## Features

### Runtime
* [X] Get object property value from path: `get(obj, 'prop.subprop')`
* [X] Set object property value from path: `set(obj, 'prop.subprop', 'value')`
* [X] Check if object has property from path: `has(obj, 'prop.subprop')`
* [X] Supports property names containing dots: `{'my.property': true}`

### While developing
* [X] Path argument is autocompleted based on the object you pass.
* [X] Strict mode to force path argument to only match possible paths.
* [X] Ability to filter out suggested paths based on a given type.

## Install

[![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https:///pr.new/Dschungelabenteuer/typedots)

```bash
# Using npm
npm i typedots
# Using Yarn
yarn add typedots
# Using pnpm
pnpm add typedots
```

## Usage

There are two ways of consuming typedots depending on your needs and preferences:

### Directly use base methods

```ts
import { get, set, has } from 'typedots';
```

### Advanced use through class
The class implements the exact same base methods.
```ts
import Typedots from 'typedots';

const td = new Typedots(); // td.get, td.set, td.has
```
It is mainly used to get finer control over the way typedots' type system behaves as further explored in [Advanced usage](#advanced-usage).

## Methods

### `get`

<table>
  <thead>
    <tr>
      <th colspan="3">
        Arguments
      </th>
    </tr>
    <tr>
      <th>name</th>
      <th>type</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>object</td>
      <td><code>Record&lt;string, any&gt;</code></td>
      <td>Base object you want to get data from.</td>
    </tr>
    <tr>
      <td>path</td>
      <td><code>string</code></td>
      <td>Path you want to get the value from.<br />Possible values should be suggested by your IDE.</td>
    </tr>
    <tr>
      <th colspan="3">
        Return type
      </th>
    </tr>
    <tr>
      <td colspan="2"><code>any | undefined</code></td>
      <td>
        It returns the property value if it exists, or <code>undefined</code> if it does not exist.
      </td>
    </tr>
  </tbody>
</table>

### `set`

<table>
  <thead>
    <tr>
      <th colspan="3">
        Arguments
      </th>
    </tr>
    <tr>
      <th>name</th>
      <th>type</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>object</td>
      <td><code>Record&lt;string, any&gt;</code></td>
      <td>Base object you want to update.</td>
    </tr>
    <tr>
      <td>path</td>
      <td><code>string</code></td>
      <td>Path you want to set the value for.<br />Possible values should be suggested by your IDE.</td>
    </tr>
    <tr>
      <td>value</td>
      <td><code>any</code></td>
      <td>Value to assign to the target property.</td>
    </tr>
    <tr>
      <td>force</td>
      <td><code>boolean</code><br />(defaults to <code>true</code>)</td>
      <td>
        Defines whether typedots should force value update.
        <br />
        When set to <code>false</code>, value update will be cancelled in the following cases:
        <ul>
          <li>The target path traverses a non-existing property
          <li>The target path traverses an intermediate property which is not an object<br />(and therefore is not supposed to have child properties)</li>
        </ul>
      </td>
    </tr>
    <tr>
      <th colspan="3">
        Return type
      </th>
    </tr>
    <tr>
      <td colspan="2"><code>boolean</code></td>
      <td>Returns <code>true</code> if the property was updated, <code>false</code> if update was cancelled.</td>
    </tr>
  </tbody>
</table>

### `has`

<table>
  <thead>
    <tr>
      <th colspan="3">
        Arguments
      </th>
    </tr>
    <tr>
      <th>name</th>
      <th>type</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>object</td>
      <td><code>Record&lt;string, any&gt;</code></td>
      <td>Base object.</td>
    </tr>
    <tr>
      <td>path</td>
      <td><code>string</code></td>
      <td>Path you want to get the value from.<br />Possible values should be automatically suggested by your IDE.</td>
    </tr>
    <tr>
      <th colspan="3">
        Return type
      </th>
    </tr>
    <tr>
      <td colspan="2"><code>boolean</code></td>
      <td>Returns <code>true</code> if the property exists, <code>false</code> if it does not exist.</td>
    </tr>
  </tbody>
</table>

> **Note**
>  When one of the properties in the path contains a dot, such property should be wrapped with parentheses so that it does not conflict with typedots inner workings. e.g. `"sites.(my.host.com).ip"`

## Advanced usage

By default, using the base methods does not enforce the `path` arguments to actually strictly match one of the values provided by autocompletion. Those are just bare suggestions and you may pass any other string without TypeScript yelling at you.

Additionally, when drawing up the list of suggestions, all paths resolving to non-object properties are automatically picked.

Both behaviours may be tweaked by making use of the `Typedots` class instead of the base methods. It provides a generic type which is constrained to the following interface:

```ts
export interface TypedotsParams = {
  expectedType?: any;
  strictMode?: boolean;
  preventDistribution?: boolean;
}
```

### Filter out suggestions by type

You may want to add some constraints to the list of suggested paths. To achieve this, you can use typedots' class and set the `expectedType` parameter in its generic type. Once set, only properties matching the type you passed in `expectedType` will be suggested in the `path` arguments. Here's a quick example which should only suggest paths resolving to functions:

```ts
const obj = {
  myProperty: 'value of my property',
  myMethod: (message) => `received ${message}`,
  helpers: { maxLength: 255, count(item) { return item.length; } },
};

const typedots = new Typedots<{ expectedType: (...args: any) => any }>();
const method = typedots.get(obj, ''); // <-- should only suggest "myMethod" and "helpers.count"
```

Please note that typedots relies on TypeScript's own type inference mechanism. This means its behaviour may be influenced by TypeScript's configuration.

#### False, undefined and null values

For example, [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) changes the way types are infered:

```ts
/** > When `strictNullChecks: false`: */
// infered as { prop, string un: any }
const obj = { prop: 'some string', un: undefined };
new Typedots<{ expectedType: string }>(); // suggests "prop" | "un"

/** > When `strictNullChecks: true`: */
// infered as { prop: string, un: undefined }
const obj = { prop: 'some string', un: undefined };
new Typedots<{ expectedType: string }>(); // suggests "prop"
```

#### Boolean distributivity

Because [conditional types in generic parameters are distributive](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types), when specifically expecting `true` or `false` types, paths resolving to `boolean` are also suggested since they match (`boolean = true | false`).

```ts
// infered as { one: boolean, two: boolean, tree: boolean }
const obj = { one: false, two: true, three: true as boolean };
new Typedots<{ expectedType: true }>(); // suggests "one" | "two" | "three"

// infered as { one: false, two: true, tree: boolean }
const obj = { one: false, two: true, three: true as boolean } as const;
new Typedots<{ expectedType: true }>(); // suggests "two" | "three"
```

You may want to go even stricter by preventing boolean to be distributed when expecting `false` or `true`. To achieve this, you can use typedots' class and set the `preventDistribution` parameter in its generic type:

```ts
// infered as { one: boolean, two: boolean, tree: boolean }
const obj = { one: false, two: true, three: true as boolean };
new Typedots<{ expectedType: true, preventDistribution: true }>(); // no suggestion

// infered as { one: false, two: true, tree: boolean }
const obj = { one: false, two: true, three: true as boolean } as const;
new Typedots<{ expectedType: true, preventDistribution: true }>(); // suggests "two"
```

### Strict mode

You can get TypeScript to ensure you're actually using one of the suggested paths, and not any other string. To achieve this, you can use typedots' class and set the `strictMode` parameter in its generic type. Once set, TypeScript should raise errors any time you set the `path` arguments to a string value which was not suggested.

```ts
const obj = {
  myProperty: 'value of my property',
  myMethod: (message) => `received ${message}`,
  helpers: { maxLength: 255, count(item) { return item.length; } },
};

const typedots = new Typedots<{ strictMode: true }>();
typedots.get(obj, 'myProperty'); // <-- works!
typedots.get(obj, 'helpers.maxLength'); // <-- works!
typedots.get(obj, 'oops'); // <-- should raise a TypeScript error
typedots.get(obj, 'helpers.oops'); // <-- should raise a TypeScript error
```

Note that both `expectedType` and `strictMode` can be combined to work together:

```ts
const typedots = new Typedots<{
  strictMode: true,
  expectedType: (...args: any) => any },
}>();
typedots.get(obj, 'myMethod'); // <-- works!
typedots.get(obj, 'helpers.count'); // <-- works!
typedots.get(obj, 'myProperty'); // <-- should raise a TypeScript error
typedots.get(obj, 'helpers.maxLength'); // <-- should raise a TypeScript error
```

### Exported type

The type which powers the suggestion system is exported as `ExtractObjectPaths`, you may be interested in using it even if you're not actually using the runtime methods. It takes three generic parameters:
1. `BaseObject`, which extends any non-null object.
2. `ExpectedType`, see [Filter out suggestions by type](#filter-out-suggestions-by-type)
3. `PreventDistribution`, see [Boolean distributivity](#boolean-distributivity)

## Examples

```ts
import { get, set, has } from 'typedots';

const variableName = 'content';
const baseObject = {
  prop1: true,
  prop2: false,
  prop3: {
    subprop1: 'string',
    subprop2: ['first', 2_000, { third: undefined }],
    subprop3: { one: true, two: true, three: false },
    subprop4: undefined,
  },
  [variableName]: {},
  'prop.5': { nested: 'string', 'another.sub.prop': {} },
};

get(baseObject, 'prop1'); // true
get(baseObject, 'prop3.subprop1'); // "string"
get(baseObject, 'prop3.subprop3.three'); // false
get(baseObject, '(prop.5).nested'); // 'string'
get(baseObject, 'content'); // {}
get(baseObject, variableName); // {}

set(baseObject, 'prop1', value); // true
set(baseObject, 'prop100', value, false); // false
set(baseObject, 'prop100', value); // true
set(baseObject, 'prop2.child', value, false); // false
set(baseObject, 'prop2.child', value); // true

has(baseObject, 'prop1'); // true
has(baseObject, 'prop3.NOOP'); // false
has(baseObject, 'NOPE'); // false
has(baseObject, 'prop3.subprop4'); // true
has(baseObject, '(prop.5).(another.sub.prop)'); // true
```
