export const variableName = 'prop4';

export const baseObject = {
  prop1: true as boolean,
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
