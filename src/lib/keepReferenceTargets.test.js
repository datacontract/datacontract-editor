import { describe, expect, it } from 'vitest';
import { keepReferenceTargets } from './keepReferenceTargets.js';
import { odcsErrors } from '../utils/fixtures/odcsValidator.js';

const contract = (apiVersion = 'v3.2.0') => ({
  apiVersion,
  schema: [
    {
      name: 'orders',
      properties: [
        { name: 'order_id' },
        { name: 'id' },
        { name: 'address', logicalType: 'object', properties: [{ name: 'street' }] },
      ],
    },
    {
      name: 'items',
      relationships: [{ from: ['items.order', 'items.number'], to: ['orders.order_id', 'orders.id'] }],
      properties: [
        { name: 'order', relationships: [{ to: 'orders.order_id' }] },
        { name: 'number', relationships: [{ to: 'orders.id' }] },
      ],
    },
  ],
});

const rename = (before, change) => {
  const after = structuredClone(before);
  change(after);
  return keepReferenceTargets(before, after);
};
const renameOrderId = (before, name) => rename(before, (c) => { c.schema[0].properties[0].name = name; });
const orderTo = (result) => result.schema[1].properties[0].relationships[0].to;
const numberTo = (result) => result.schema[1].properties[1].relationships[0].to;
const errors = ({ apiVersion, ...parts }) => odcsErrors(apiVersion, parts);

describe('keepReferenceTargets', () => {
  it.each(['v3.1.0', 'v3.2.0'])('follows a renamed property in %s', (apiVersion) => {
    const result = renameOrderId(contract(apiVersion), 'order_key');
    expect(orderTo(result)).toBe('orders.order_key');
    expect(numberTo(result)).toBe('orders.id');
    expect(result.schema[1].relationships[0]).toEqual({ from: ['items.order', 'items.number'], to: ['orders.order_key', 'orders.id'] });
    expect(result.schema[0].id).toBeUndefined();
    expect(errors(result)).toEqual([]);
  });

  it('follows a renamed schema, and a renamed source in from', () => {
    const result = rename(contract(), (c) => { c.schema[0].name = 'purchases'; c.schema[1].properties[0].name = 'purchase'; });
    expect(orderTo(result)).toBe('purchases.order_id');
    expect(result.schema[1].relationships[0].from).toEqual(['items.purchase', 'items.number']);
  });

  it.each([
    ['v3.2.0', 'order key', 'order_key'],
    ['v3.2.0', '2024_total', '2024_total'],
    ['v3.1.0', 'order key', 'order_key'],
    ['v3.1.0', 'größe', 'gr_e'],
  ])('uses ids in %s for %s, which has no valid shorthand', (apiVersion, name, id) => {
    const result = renameOrderId(contract(apiVersion), name);
    expect(orderTo(result)).toBe(`schema/orders/properties/${id}`);
    expect(result.schema[0].id).toBe('orders');
    expect(result.schema[0].properties[0].id).toBe(id);
    expect(errors(result)).toEqual([]);
  });

  it.each(['v3.1.0', 'v3.2.0'])('writes a hyphen as shorthand in %s', (apiVersion) => {
    const result = renameOrderId(contract(apiVersion), 'order-key');
    expect(orderTo(result)).toBe('orders.order-key');
    expect(errors(result)).toEqual([]);
  });

  it('keeps references apart when two properties get the same name', () => {
    const result = renameOrderId(contract(), 'id');
    expect(orderTo(result)).toBe('schema/orders/properties/id_2');
    expect(numberTo(result)).toBe('schema/orders/properties/id_3');
    expect(result.schema[0].properties.map((p) => p.id)).toEqual(['id_2', 'id_3', undefined]);
    expect(errors(result)).toEqual([]);
  });

  it('keeps references to a property whose name an unreferenced one takes', () => {
    const before = contract();
    before.schema[0].properties.unshift({ name: 'foo' });
    const result = rename(before, (c) => { c.schema[0].properties[0].name = 'order_id'; });
    expect(orderTo(result)).toBe('schema/orders/properties/order_id_2');
    expect(result.schema[0].properties[1].id).toBe('order_id_2');
    expect(numberTo(result)).toBe('orders.id');
  });

  it('keeps references to a property whose name is cleared', () => {
    const result = renameOrderId(contract(), '');
    expect(orderTo(result)).toBe('schema/orders/properties/order_id');
  });

  it('keeps existing ids, and leaves references by id alone', () => {
    const before = contract();
    before.schema[0].id = 'orders_tbl';
    before.schema[0].properties[0].id = 'order_id_pk';
    before.schema[1].properties[1].relationships[0].to = 'schema/orders_tbl/properties/order_id_pk';
    const result = renameOrderId(before, 'order key');
    expect(orderTo(result)).toBe('schema/orders_tbl/properties/order_id_pk');
    expect(numberTo(result)).toBe('schema/orders_tbl/properties/order_id_pk');
  });

  it('gives names in the fully qualified notation real ids', () => {
    const before = contract();
    before.schema[1].properties[0].relationships[0].to = 'schema/orders/properties/order_id';
    const result = renameOrderId(before, 'order key');
    expect(orderTo(result)).toBe('schema/orders/properties/order_key');
    expect(result.schema[0].properties[0].id).toBe('order_key');
  });

  it.each(['v3.1.0', 'v3.2.0'])('follows nested properties in %s', (apiVersion) => {
    const before = contract(apiVersion);
    before.schema[1].properties[0].relationships[0].to = 'orders.address.street';
    const result = rename(before, (c) => { c.schema[0].properties[2].name = 'location'; });
    expect(orderTo(result)).toBe('orders.location.street');
    expect(errors(result)).toEqual([]);
  });

  it('follows relationships held by properties in array items and maps', () => {
    const before = contract();
    const holder = { name: 'holder', relationships: [{ to: 'orders.order_id' }] };
    before.schema[1].properties.push(
      { name: 'list', items: { properties: [structuredClone(holder)] } },
      { name: 'map', map: { key: {}, value: { properties: [structuredClone(holder)] } } },
    );
    const [, , list, map] = renameOrderId(before, 'order_key').schema[1].properties;
    expect(list.items.properties[0].relationships[0].to).toBe('orders.order_key');
    expect(map.map.value.properties[0].relationships[0].to).toBe('orders.order_key');
  });

  it('follows the matching entries of an SLA element', () => {
    const before = { ...contract(), slaProperties: [{ property: 'latency', value: 4, element: 'items.order, orders.order_id,other.order_id' }] };
    expect(renameOrderId(before, 'order key').slaProperties[0].element).toBe('items.order, orders.order key,other.order_id');
    expect(renameOrderId(before, 'id').slaProperties[0].element).toBe('items.order, orders.id,other.order_id');
    expect(renameOrderId(before, '').slaProperties[0].element).toBe('items.order, orders.order_id,other.order_id');
  });

  it('follows the deprecated default SLA element', () => {
    expect(renameOrderId({ ...contract(), slaDefaultElement: 'orders.order_id' }, 'order_key').slaDefaultElement).toBe('orders.order_key');
  });

  it('leaves external and already broken references alone', () => {
    const before = contract();
    before.schema[1].properties[0].relationships[0].to = 'other.yaml#/schema/orders/properties/order_id';
    before.schema[1].properties[1].relationships[0].to = 'orders.missing';
    const result = renameOrderId(before, 'order_key');
    expect(orderTo(result)).toBe('other.yaml#/schema/orders/properties/order_id');
    expect(numberTo(result)).toBe('orders.missing');
  });

  it('does not change the contracts passed in', () => {
    const before = contract();
    const snapshot = structuredClone(before);
    renameOrderId(before, 'order key');
    expect(before).toEqual(snapshot);
    expect(keepReferenceTargets({}, { name: 'x' })).toEqual({ name: 'x' });
  });

  it('keeps shorthand before 3.1.0, which has no ids', () => {
    const result = renameOrderId(contract('v3.0.2'), 'order-key');
    expect(orderTo(result)).toBe('orders.order-key');
    expect(result.schema[0].id).toBeUndefined();
  });
});
