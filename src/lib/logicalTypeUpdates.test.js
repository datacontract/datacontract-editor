import { describe, expect, it } from 'vitest';
import { logicalTypeUpdates } from './logicalTypeUpdates.js';
import { propertyErrors } from '../utils/fixtures/odcsValidator.js';

const byType = {
  string: { logicalTypeOptions: { minLength: 1, format: 'email' } },
  date: { logicalTypeOptions: { format: 'yyyy', minimum: '2020-01-01' } },
  timestamp: { logicalTypeOptions: { format: 'yyyy', timezone: true, defaultTimezone: 'UTC' } },
  time: { logicalTypeOptions: { timezone: true } },
  number: { logicalTypeOptions: { minimum: 1, format: 'f32' } },
  integer: { logicalTypeOptions: { maximum: 1, format: 'i32' } },
  object: { properties: [{ name: 'a', logicalType: 'string' }] },
  array: { items: { logicalType: 'string' }, logicalTypeOptions: { minItems: 1 } },
  boolean: {},
  map: { map: { key: { logicalType: 'string' }, value: { logicalType: 'string' } } },
  vector: { logicalTypeOptions: { dimensions: 384 } },
};
const onlySince320 = ['map', 'vector'];
const change = (from, to) => {
  const property = { name: 'p', logicalType: from, ...byType[from] };
  return { ...property, ...logicalTypeUpdates(property, to) };
};

describe('logicalTypeUpdates', () => {
  for (const apiVersion of ['v3.1.0', 'v3.2.0']) {
    const types = Object.keys(byType).filter((type) => apiVersion === 'v3.2.0' || !onlySince320.includes(type));
    it.each(types)(`leaves nothing of a %s behind that ${apiVersion} forbids`, (from) => {
      for (const to of [...types, undefined]) {
        expect({ to, errors: propertyErrors(apiVersion, change(from, to)) }).toEqual({ to, errors: [] });
      }
    });
  }

  it('keeps what ODCS allows without a type when the type is cleared', () => {
    expect(change('array', undefined).items).toEqual(byType.array.items);
    expect(change('object', undefined).properties).toEqual(byType.object.properties);
  });

  it('keeps the options the new type shares', () => {
    expect(change('timestamp', 'date').logicalTypeOptions).toEqual({ format: 'yyyy' });
    expect(change('integer', 'number').logicalTypeOptions).toEqual({ maximum: 1 });
  });

  it.each(Object.keys(byType))('deletes nothing of a %s for a half-typed type', (from) => {
    expect(change(from, 'ob')).toEqual({ name: 'p', ...byType[from], logicalType: 'ob' });
  });

  it('changes nothing else when the type stays the same', () => {
    expect(change('array', 'array')).toEqual({ name: 'p', logicalType: 'array', ...byType.array });
    expect(change('map', 'map')).toEqual({ name: 'p', logicalType: 'map', ...byType.map });
  });
});
