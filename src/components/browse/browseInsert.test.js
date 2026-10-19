import { describe, expect, it } from 'vitest';
import { buildPropertyFromBrowseDrag, linkPropertyFromBrowseDrag } from './browseInsert.js';

const column = { name: 'ORDER_ID', logicalType: 'string', physicalType: 'VARCHAR', description: 'The order' };

function documentWith(property) {
  const doc = { schema: [{ properties: [property] }] };
  return {
    doc,
    getValue: () => doc.schema[0].properties[0],
    setValue: (_path, value) => { doc.schema[0].properties[0] = value; },
  };
}

describe('asset column drags', () => {
  it('copies the column without lineage', () => {
    const property = buildPropertyFromBrowseDrag({ source: 'browse', kind: 'asset', property: column });

    expect(property).toEqual({ name: 'ORDER_ID', logicalType: 'string', physicalType: 'VARCHAR', description: 'The order' });
    expect(property.transformSourceObjects).toBeUndefined();
  });

  it('maps an existing property onto the column', () => {
    const { doc, getValue, setValue } = documentWith({ name: 'order_id', logicalType: 'string' });

    const linked = linkPropertyFromBrowseDrag(getValue, setValue, 0, 0, { kind: 'asset', property: column });

    expect(linked).toBe(true);
    expect(doc.schema[0].properties[0]).toEqual({ name: 'order_id', logicalType: 'string', physicalName: 'ORDER_ID', physicalType: 'VARCHAR' });
  });

  it('keeps the physical type a property already has', () => {
    const { doc, getValue, setValue } = documentWith({ name: 'order_id', physicalType: 'TEXT' });

    linkPropertyFromBrowseDrag(getValue, setValue, 0, 0, { kind: 'asset', property: column });

    expect(doc.schema[0].properties[0].physicalType).toBe('TEXT');
  });
});
