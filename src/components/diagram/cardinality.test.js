import { describe, it, expect } from 'vitest';
import { getCardinality } from './cardinality.js';

describe('getCardinality', () => {
  const pk = { primaryKey: true };

  it('labels relationships to a primary key by the foreign key constraints', () => {
    expect(getCardinality({ unique: true, required: true }, pk)).toBe('1');
    expect(getCardinality({ unique: true }, pk)).toBe('?');
    expect(getCardinality({ required: true }, pk)).toBe('n');
    expect(getCardinality({}, pk)).toBe('n');
  });

  it('has no label when the referenced property is not a primary key', () => {
    expect(getCardinality({ unique: true, required: true }, { unique: true })).toBeNull();
    expect(getCardinality({}, undefined)).toBeNull();
  });
});
