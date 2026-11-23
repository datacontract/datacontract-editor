import { describe, expect, it } from 'vitest';
import { staysInPlace } from './staysInPlace.js';

const contract = (...properties) => ({ schema: [{ name: 'orders', properties }] });
const PATH = 'schema[0].properties[1]';

describe('staysInPlace', () => {
  const before = contract({ name: 'id' }, { name: 'amount' });

  it('holds for edits and renames', () => {
    expect(staysInPlace(before, contract({ name: 'id', required: true }, { name: 'amount', unique: true }), PATH)).toBe(true);
    expect(staysInPlace(before, contract({ name: 'id' }, { name: 'total' }), PATH)).toBe(true);
  });

  it('does not hold when a sibling is added, removed or reordered', () => {
    expect(staysInPlace(before, contract({ name: 'new' }, { name: 'id' }, { name: 'amount' }), PATH)).toBe(false);
    expect(staysInPlace(before, contract({ name: 'amount' }), PATH)).toBe(false);
    expect(staysInPlace(before, contract({ name: 'amount' }, { name: 'id' }), PATH)).toBe(false);
  });

  it('does not hold when a table moves or disappears', () => {
    const [orders] = before.schema;
    expect(staysInPlace({ schema: [{ name: 'customers' }, orders] }, before, 'schema[1].properties[1]')).toBe(false);
    expect(staysInPlace(before, { schema: [] }, PATH)).toBe(false);
    expect(staysInPlace(before, {}, PATH)).toBe(false);
  });

  it('compares the content of unnamed elements', () => {
    const relationships = (...list) => contract({ name: 'id' }, { name: 'amount', relationships: list });
    const path = `${PATH}.relationships[0]`;
    expect(staysInPlace(relationships({ to: 'a.id' }, { to: 'b.id' }), relationships({ to: 'c.id' }, { to: 'b.id' }), path)).toBe(true);
    expect(staysInPlace(relationships({ to: 'a.id' }, { to: 'b.id' }), relationships({ to: 'b.id' }, { to: 'a.id' }), path)).toBe(false);
  });
});
